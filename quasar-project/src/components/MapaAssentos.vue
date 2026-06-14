<template>
  <div v-if="carregando" class="text-grey-7">Carregando mapa de assentos...</div>
  <div v-else-if="!assento" class="text-grey-7">Sala sem configuracao de assentos.</div>
  <div v-else>
    <div class="text-subtitle2 q-mb-sm text-center">TELA</div>
    <div class="mapa-assentos q-mb-sm">
      <div v-for="f in fileiras" :key="f" class="row q-gutter-xs q-mb-xs justify-center">
        <span class="fileira-label text-caption text-grey-7">{{ fileiraLabel(f) }}</span>
        <q-btn
          v-for="c in colunas"
          :key="c"
          :label="`${c}`"
          :color="corAssento(f, c)"
          :text-color="corTexto(f, c)"
          :disable="desabilitado(f, c)"
          size="sm"
          dense
          unelevated
          class="assento-btn"
          @click="toggleAssento(f, c)"
        />
      </div>
    </div>
    <div class="row q-gutter-sm justify-center text-caption">
      <div><q-badge color="grey-4" text-color="dark" label="Livre" /></div>
      <div><q-badge color="primary" label="Selecionado" /></div>
      <div><q-badge color="negative" label="Ocupado" /></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { getAllSessoesFromRest } from '@/services/sessoesServices.js'
import { getAssentosBySalaFromRest } from '@/services/assentoServices.js'
import { getIngressosBySessaoFromRest } from '@/services/ingressoServices.js'
import { getAllPedidosFromRest } from '@/services/pedidoServices.js'

const STATUS_OCUPADO = ['pendente', 'aprovado', 'pago']

const props = defineProps({
  sessaoId: { type: Number, default: null },
  pedidoId: { type: Number, default: null },
  modelValue: { type: Array, default: () => [] },
  readonly: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const carregando = ref(false)
const assento = ref(null)
const ingressosSessao = ref([])
const pedidosPorId = ref({})

const fileiras = computed(() => {
  if (!assento.value?.fileira) return []
  return Array.from({ length: assento.value.fileira }, (_, i) => i + 1)
})

const colunas = computed(() => {
  if (!assento.value?.coluna) return []
  return Array.from({ length: assento.value.coluna }, (_, i) => i + 1)
})

function fileiraLabel(numero) {
  return String.fromCharCode(64 + numero)
}

function isSelecionado(fileira, coluna) {
  return props.modelValue.some((a) => a.fileira === fileira && a.coluna === coluna)
}

function isOcupado(fileira, coluna) {
  const ingresso = ingressosSessao.value.find(
    (i) => i.fileira === fileira && i.coluna === coluna,
  )
  if (!ingresso?.pedido_id) return false
  if (props.pedidoId && ingresso.pedido_id === props.pedidoId) return false

  const pedido = pedidosPorId.value[ingresso.pedido_id]
  if (!pedido) return false
  return STATUS_OCUPADO.includes(pedido.status)
}

function corAssento(fileira, coluna) {
  if (isSelecionado(fileira, coluna)) return 'primary'
  if (isOcupado(fileira, coluna)) return 'negative'
  return 'grey-4'
}

function corTexto(fileira, coluna) {
  if (isSelecionado(fileira, coluna) || isOcupado(fileira, coluna)) return 'white'
  return 'dark'
}

function desabilitado(fileira, coluna) {
  if (props.readonly) return true
  return isOcupado(fileira, coluna)
}

function toggleAssento(fileira, coluna) {
  if (desabilitado(fileira, coluna)) return

  if (isSelecionado(fileira, coluna)) {
    emit(
      'update:modelValue',
      props.modelValue.filter((a) => !(a.fileira === fileira && a.coluna === coluna)),
    )
  } else {
    emit('update:modelValue', [...props.modelValue, { fileira, coluna }])
  }
}

function carregarMapa() {
  if (!props.sessaoId) {
    assento.value = null
    ingressosSessao.value = []
    return
  }

  carregando.value = true

  Promise.all([
    getAllSessoesFromRest(),
    getIngressosBySessaoFromRest(props.sessaoId),
    getAllPedidosFromRest(),
  ])
    .then(([sessoes, ingressos, pedidos]) => {
      pedidosPorId.value = Object.fromEntries(pedidos.map((p) => [p.id, p]))
      ingressosSessao.value = ingressos

      const sessao = sessoes.find((s) => s.id === props.sessaoId)
      if (!sessao) {
        assento.value = null
        return
      }

      return getAssentosBySalaFromRest(sessao.sala_id).then((assentos) => {
        assento.value = assentos[0] || null
      })
    })
    .catch((err) => {
      console.log('Erro ao carregar mapa de assentos:', err)
    })
    .finally(() => {
      carregando.value = false
    })
}

watch(
  () => props.sessaoId,
  () => carregarMapa(),
  { immediate: true },
)

defineExpose({ recarregar: carregarMapa })
</script>

<style scoped>
.fileira-label {
  width: 20px;
  line-height: 28px;
  text-align: right;
}

.assento-btn {
  min-width: 32px;
  width: 32px;
  padding: 0;
}
</style>
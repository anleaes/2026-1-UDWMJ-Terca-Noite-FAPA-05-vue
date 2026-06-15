<template>
  <q-page class="q-pa-lg">
    <q-btn flat label="Voltar" to="/" icon="arrow_back" class="q-mb-md" />

    <h5 class="q-my-none q-mb-lg">{{ titulo }}</h5>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">
          {{ editando ? `Editar ${nomeEntidade}` : `Novo ${nomeEntidade}` }}
        </div>

        <div class="row q-col-gutter-md">
          <div
            v-for="campo in campos"
            :key="campo.name"
            :class="campo.col || 'col-12 col-md-6'"
          >
            <q-input
              v-if="!campo.type || campo.type === 'text' || campo.type === 'url'"
              v-model="form[campo.name]"
              :label="campo.label"
              outlined
              dense
            />

            <q-input
              v-else-if="campo.type === 'email'"
              v-model="form[campo.name]"
              :label="campo.label"
              type="email"
              outlined
              dense
            />

            <q-input
              v-else-if="campo.type === 'date'"
              v-model="form[campo.name]"
              :label="campo.label"
              mask="####-##-##"
              outlined
              dense
            />

            <q-input
              v-else-if="campo.type === 'number'"
              v-model.number="form[campo.name]"
              :label="campo.label"
              type="number"
              outlined
              dense
            />

            <q-input
              v-else-if="campo.type === 'textarea'"
              v-model="form[campo.name]"
              :label="campo.label"
              type="textarea"
              autogrow
              outlined
              dense
            />

            <q-input
              v-else-if="isCampoComMascara(campo)"
              v-model="form[campo.name]"
              :label="campo.label"
              :mask="mascaraDoCampo(campo)"
              outlined
              dense
            />

            <q-select
              v-else-if="campo.type === 'select' || campo.type === 'select-multiple'"
              v-model="form[campo.name]"
              :label="campo.label"
              :options="campo.options || []"
              :multiple="campo.type === 'select-multiple'"
              :use-chips="campo.type === 'select-multiple'"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              outlined
              dense
            />

            <q-toggle
              v-else-if="campo.type === 'toggle'"
              v-model="form[campo.name]"
              :label="campo.label"
            />
          </div>
        </div>

        <div class="q-mt-md q-gutter-sm">
          <q-btn
            color="primary"
            :label="editando ? 'Salvar' : 'Cadastrar'"
            @click="salvar"
          />
          <q-btn v-if="editando" flat label="Cancelar" @click="limparForm" />
        </div>
      </q-card-section>
    </q-card>

    <q-table
      :title="`${titulo} cadastrados`"
      :rows="registros"
      :columns="colunasTabela"
      :filter="filtro"
      row-key="id"
      flat
      bordered
      :no-data-label="`Nenhum ${nomeEntidade} cadastrado`"
    >
      <template #top-right>
        <q-input v-model="filtro" dense outlined placeholder="Pesquisar" clearable />
      </template>

      <template #body-cell-acoes="props">
        <q-td :props="props">
          <q-btn flat round icon="edit" color="primary" @click="editar(props.row)" />
          <q-btn flat round icon="delete" color="negative" @click="excluir(props.row.id)" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  titulo: { type: String, required: true },
  nomeEntidade: { type: String, required: true },
  campos: { type: Array, required: true },
  colunas: { type: Array, required: true },
  service: { type: Object, required: true },
})

const registros = ref([])
const filtro = ref('')
const editando = ref(false)
const registroId = ref(null)
const form = ref(criarFormVazio())

const colunasTabela = computed(() =>
  props.colunas.map((col) =>
    col.name === 'acoes' ? col : { ...col, sortable: true }
  )
)

function isCampoComMascara(campo) {
  return ['cpf', 'cnpj', 'tel'].includes(campo.type) || campo.mask
}

function mascaraDoCampo(campo) {
  if (campo.mask) return campo.mask
  if (campo.type === 'cpf') return '###.###.###-##'
  if (campo.type === 'cnpj') return '##.###.###/####-##'
  if (campo.type === 'tel') return '(##) #####-####'
  return undefined
}

function valorInicial(campo) {
  if (campo.type === 'number') return null
  if (campo.type === 'select-multiple') return []
  if (campo.type === 'toggle') return false
  return ''
}

function criarFormVazio() {
  const novoForm = {}
  props.campos.forEach((campo) => {
    novoForm[campo.name] = valorInicial(campo)
  })
  return novoForm
}

function campoVazio(campo) {
  const valor = form.value[campo.name]
  if (campo.type === 'toggle') return false
  if (campo.type === 'select-multiple') return !valor || valor.length === 0
  return valor === null || valor === undefined || valor === ''
}

function limparMascara(valor) {
  if (typeof valor !== 'string') return valor
  return valor.replace(/\D/g, '')
}

function montarDados() {
  const dados = {}

  props.campos.forEach((campo) => {
    let valor = form.value[campo.name]

    if (['cpf', 'cnpj', 'tel'].includes(campo.type)) {
      valor = limparMascara(valor)
    }

    if (campo.type === 'number' && valor !== null && valor !== '') {
      dados[campo.name] = Number(valor)
    } else {
      dados[campo.name] = valor
    }
  })

  return dados
}

function carregarRegistros() {
  props.service
    .getAll()
    .then((lista) => {
      registros.value = lista
    })
    .catch((err) => {
      console.log(`Erro ao carregar ${props.nomeEntidade}:`, err)
    })
}

function salvar() {
  if (props.campos.find((campo) => campo.required && campoVazio(campo))) return

  const dados = montarDados()
  const acao = editando.value
    ? props.service.update(registroId.value, { ...dados, id: registroId.value })
    : props.service.create(dados)

  acao
    .then(() => {
      limparForm()
      carregarRegistros()
    })
    .catch((err) => {
      console.log(`Erro ao salvar ${props.nomeEntidade}:`, err)
    })
}

function editar(registro) {
  editando.value = true
  registroId.value = registro.id

  props.campos.forEach((campo) => {
    form.value[campo.name] = registro[campo.name] ?? valorInicial(campo)
  })
}

function excluir(id) {
  props.service
    .delete(id)
    .then(() => carregarRegistros())
    .catch((err) => {
      console.log(`Erro ao excluir ${props.nomeEntidade}:`, err)
    })
}

function limparForm() {
  editando.value = false
  registroId.value = null
  form.value = criarFormVazio()
}

onMounted(() => {
  carregarRegistros()
})
</script>

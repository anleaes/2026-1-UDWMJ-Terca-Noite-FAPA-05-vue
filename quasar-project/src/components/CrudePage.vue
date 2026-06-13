<template>
  <q-page class="q-pa-lg">
    <q-btn flat label="Voltar" :to="voltarPara" icon="arrow_back" class="q-mb-md" />

    <h5 class="q-my-none">{{ titulo }}</h5>
    <p class="text-grey-7 q-mb-lg">{{ descricao }}</p>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">
          {{ editando ? `Editar ${nomeEntidade}` : `Novo ${nomeEntidade}` }}
        </div>

        <div class="row q-col-gutter-md">
          <div
            v-for="campo in camposVisiveis"
            :key="campo.name"
            :class="campo.col || colPadrao(campo)"
          >
            <q-input
              v-if="isInputTexto(campo)"
              v-model="form[campo.name]"
              :label="campo.label"
              :type="inputHtmlType(campo)"
              :mask="mascaraDoCampo(campo)"
              :hint="campo.hint"
              :readonly="campoSomenteLeitura(campo)"
              outlined
              dense
            />

            <q-input
              v-else-if="campo.type === 'number' || campo.type === 'money'"
              v-model.number="form[campo.name]"
              :label="campo.label"
              type="number"
              :step="campo.type === 'money' ? '0.01' : '1'"
              :min="campo.min"
              :max="campo.max"
              :hint="campo.hint"
              outlined
              dense
            />

            <q-input
              v-else-if="campo.type === 'textarea'"
              v-model="form[campo.name]"
              :label="campo.label"
              type="textarea"
              :hint="campo.hint"
              autogrow
              outlined
              dense
            />

            <q-input
              v-else-if="campo.type === 'date'"
              v-model="form[campo.name]"
              :label="campo.label"
              mask="####-##-##"
              :hint="campo.hint"
              outlined
              dense
            >
              <template #append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="form[campo.name]" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Fechar" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-input
              v-else-if="campo.type === 'url' || campo.type === 'image'"
              v-model="form[campo.name]"
              :label="campo.label"
              type="url"
              :hint="campo.hint || 'Cole o link da imagem'"
              outlined
              dense
            />

            <q-select
              v-else-if="isSelect(campo)"
              v-model="form[campo.name]"
              :label="campo.label"
              :options="opcoesDoCampo(campo)"
              :multiple="campo.type === 'select-multiple'"
              :use-chips="campo.type === 'select-multiple'"
              :hint="campo.hint"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              outlined
              dense
            />

            <q-toggle
              v-else-if="campo.type === 'toggle' || campo.type === 'boolean'"
              v-model="form[campo.name]"
              :label="campo.label"
            />
          </div>
        </div>

        <div class="q-mt-md q-gutter-sm">
          <q-btn
            color="primary"
            :label="editando ? 'Salvar' : 'Cadastrar'"
            :loading="salvando"
            @click="salvar"
          />
          <q-btn v-if="editando" flat label="Cancelar" @click="limparForm" />
        </div>
      </q-card-section>
    </q-card>

    <q-table
      :title="tituloTabelaFinal"
      :rows="registros"
      :columns="colunasTabela"
      row-key="id"
      flat
      bordered
      :loading="carregando"
      :no-data-label="mensagemVaziaFinal"
    >
      <template
        v-for="coluna in colunasImagem"
        :key="coluna.name"
        #[`body-cell-${coluna.name}`]="props"
      >
        <q-td :props="props">
          <q-img
            v-if="props.row[coluna.name]"
            :src="props.row[coluna.name]"
            style="width: 48px; height: 72px"
            fit="cover"
          />
          <span v-else class="text-grey-6">-</span>
        </q-td>
      </template>

      <template
        v-for="coluna in colunasBadge"
        :key="`badge-${coluna.name}`"
        #[`body-cell-${coluna.name}`]="props"
      >
        <q-td :props="props">
          <q-badge
            v-if="props.row[coluna.name]"
            :color="corBadge(coluna, props.row[coluna.name])"
            :label="formatarValorColuna(coluna, props.row[coluna.name])"
          />
          <span v-else class="text-grey-6">-</span>
        </q-td>
      </template>

      <template #body-cell-acoes="props">
        <q-td :props="props">
          <q-btn flat round icon="edit" color="primary" @click="editar(props.row)" />
          <q-btn flat round icon="delete" color="negative" @click="solicitarExclusao(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogExcluir">
      <q-card>
        <q-card-section class="text-h6">Confirmar exclusao</q-card-section>
        <q-card-section>
          Deseja excluir este {{ nomeEntidade }}?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Excluir" color="negative" :loading="excluindo" @click="excluir" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { API_URL } from '@/services/api.js'

const props = defineProps({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  nomeEntidade: { type: String, required: true },
  campos: { type: Array, required: true },
  colunas: { type: Array, required: true },
  service: { type: Object, required: true },
  tituloTabela: { type: String, default: '' },
  mensagemVazia: { type: String, default: '' },
  voltarPara: { type: String, default: '/' },
  confirmarExclusao: { type: Boolean, default: true },
})

const $q = useQuasar()

const registros = ref([])
const editando = ref(false)
const registroId = ref(null)
const registroExcluirId = ref(null)
const form = ref({})
const carregando = ref(false)
const salvando = ref(false)
const excluindo = ref(false)
const dialogExcluir = ref(false)
const opcoesRemotas = ref({})
const mapaOpcoes = ref({})

const tituloTabelaFinal = computed(
  () => props.tituloTabela || `${props.titulo} cadastrados`,
)
const mensagemVaziaFinal = computed(
  () => props.mensagemVazia || `Nenhum ${props.nomeEntidade} cadastrado`,
)
const colunasImagem = computed(() =>
  props.colunas.filter((coluna) => coluna.type === 'image'),
)
const colunasBadge = computed(() =>
  props.colunas.filter((coluna) => coluna.type === 'badge'),
)
const camposVisiveis = computed(() =>
  props.campos.filter((campo) => !campo.hideInForm),
)

const colunasTabela = computed(() =>
  props.colunas.map((coluna) => {
    if (coluna.format) return coluna
    if (coluna.type === 'money') {
      return { ...coluna, format: (valor) => formatarMoeda(valor) }
    }
    if (coluna.type === 'select' || coluna.type === 'select-multiple') {
      return {
        ...coluna,
        format: (valor) => formatarValorColuna(coluna, valor),
      }
    }
    return coluna
  }),
)

const endpointsNecessarios = computed(() => {
  const endpoints = new Set()

  props.campos.forEach((campo) => {
    if (campo.optionsEndpoint) endpoints.add(campo.optionsEndpoint)
  })

  props.colunas.forEach((coluna) => {
    if (coluna.optionsEndpoint) endpoints.add(coluna.optionsEndpoint)
  })

  return [...endpoints]
})

function isInputTexto(campo) {
  return (
    !campo.type ||
    campo.type === 'text' ||
    campo.type === 'email' ||
    campo.type === 'tel' ||
    campo.type === 'cpf' ||
    campo.type === 'cnpj'
  )
}

function isSelect(campo) {
  return campo.type === 'select' || campo.type === 'select-multiple'
}

function inputHtmlType(campo) {
  if (campo.type === 'email') return 'email'
  if (campo.type === 'tel') return 'tel'
  return 'text'
}

function mascaraDoCampo(campo) {
  if (campo.mask) return campo.mask
  if (campo.type === 'cpf') return '###.###.###-##'
  if (campo.type === 'cnpj') return '##.###.###/####-##'
  if (campo.type === 'tel') return mascaraTelefone(form.value[campo.name])
  return undefined
}

function digitosTelefone(valor) {
  return limparMascara(String(valor || ''))
}

function mascaraTelefone(valor) {
  const digitos = digitosTelefone(valor)
  if (digitos.length > 10) return '(##) #####-####'
  return '(##) ####-####'
}

function formatarTelefone(valor) {
  const digitos = digitosTelefone(valor)

  if (digitos.length === 11) {
    return digitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  if (digitos.length === 10) {
    return digitos.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return valor ?? ''
}

function colPadrao(campo) {
  if (['textarea', 'url', 'image'].includes(campo.type)) return 'col-12'
  if (campo.type === 'toggle' || campo.type === 'boolean') return 'col-12'
  return 'col-12 col-md-6'
}

function valorInicial(campo) {
  if (campo.type === 'number' || campo.type === 'money') return null
  if (campo.type === 'select-multiple') return []
  if (campo.type === 'toggle' || campo.type === 'boolean') return false
  return ''
}

function campoSomenteLeitura(campo) {
  return Boolean(campo.readonly || (campo.readonlyOnEdit && editando.value))
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

  if (campo.type === 'select-multiple') {
    return !valor || valor.length === 0
  }

  if (campo.type === 'toggle' || campo.type === 'boolean') {
    return false
  }

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

    if ((campo.type === 'number' || campo.type === 'money') && valor !== null && valor !== '') {
      dados[campo.name] = Number(valor)
    } else {
      dados[campo.name] = valor
    }
  })

  return dados
}

function opcoesDoCampo(campo) {
  if (campo.options?.length) return campo.options
  if (campo.optionsEndpoint) return opcoesRemotas.value[campo.optionsEndpoint] || []
  return []
}

function labelDaOpcao(endpoint, valor) {
  if (valor === null || valor === undefined || valor === '') return '-'
  return mapaOpcoes.value[endpoint]?.[valor] || String(valor)
}

function formatarMultiplos(endpoint, valores) {
  if (!valores || valores.length === 0) return '-'
  return valores.map((valor) => labelDaOpcao(endpoint, valor)).join(', ')
}

function formatarMoeda(valor) {
  if (valor === null || valor === undefined || valor === '') return '-'
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarValorColuna(coluna, valor) {
  if (coluna.type === 'tel') return formatarTelefone(valor) || '-'
  if (coluna.type === 'money') return formatarMoeda(valor)
  if (coluna.type === 'select-multiple') {
    return formatarMultiplos(coluna.optionsEndpoint, valor)
  }
  if (coluna.type === 'select') {
    return labelDaOpcao(coluna.optionsEndpoint, valor)
  }
  return valor ?? '-'
}

function corBadge(coluna, valor) {
  if (coluna.badgeColors?.[valor]) return coluna.badgeColors[valor]
  return 'primary'
}

function carregarOpcoes(endpoint, labelField = 'nome', valueField = 'id') {
  return fetch(`${API_URL}/${endpoint}`)
    .then((response) => response.json())
    .then((lista) => {
      const mapa = {}
      const opcoes = lista.map((item) => {
        mapa[item[valueField]] = item[labelField]
        return { label: item[labelField], value: item[valueField] }
      })

      mapaOpcoes.value[endpoint] = mapa
      opcoesRemotas.value[endpoint] = opcoes
    })
    .catch((err) => {
      console.log(`Erro ao carregar opcoes de ${endpoint}:`, err)
    })
}

function carregarTodasOpcoes() {
  const promessas = endpointsNecessarios.value.map((endpoint) => {
    const campo = [...props.campos, ...props.colunas].find(
      (item) => item.optionsEndpoint === endpoint,
    )

    return carregarOpcoes(
      endpoint,
      campo?.optionsLabel || 'nome',
      campo?.optionsValue || 'id',
    )
  })

  return Promise.all(promessas)
}

function carregarRegistros() {
  carregando.value = true

  props.service
    .getAll()
    .then((lista) => {
      registros.value = lista
    })
    .catch((err) => {
      console.log(`Erro ao carregar ${props.nomeEntidade}:`, err)
      $q.notify({ type: 'negative', message: `Erro ao carregar ${props.nomeEntidade}` })
    })
    .finally(() => {
      carregando.value = false
    })
}

function salvar() {
  const campoInvalido = props.campos.find(
    (campo) => campo.required && campoVazio(campo),
  )

  if (campoInvalido) {
    $q.notify({
      type: 'warning',
      message: `Preencha o campo ${campoInvalido.label}`,
    })
    return
  }

  salvando.value = true
  const dados = montarDados()
  const acao = editando.value
    ? props.service.update(registroId.value, { ...dados, id: registroId.value })
    : props.service.create(dados)

  acao
    .then(() => {
      $q.notify({
        type: 'positive',
        message: editando.value ? 'Registro atualizado' : 'Registro cadastrado',
      })
      limparForm()
      carregarRegistros()
    })
    .catch((err) => {
      console.log(`Erro ao salvar ${props.nomeEntidade}:`, err)
      $q.notify({ type: 'negative', message: `Erro ao salvar ${props.nomeEntidade}` })
    })
    .finally(() => {
      salvando.value = false
    })
}

function editar(registro) {
  editando.value = true
  registroId.value = registro.id

  props.campos.forEach((campo) => {
    const valor = registro[campo.name]

    if (campo.type === 'tel') {
      form.value[campo.name] = formatarTelefone(valor)
      return
    }

    form.value[campo.name] = valor ?? valorInicial(campo)
  })
}

function solicitarExclusao(registro) {
  if (props.confirmarExclusao) {
    registroExcluirId.value = registro.id
    dialogExcluir.value = true
    return
  }

  registroExcluirId.value = registro.id
  excluir()
}

function excluir() {
  excluindo.value = true

  props.service
    .delete(registroExcluirId.value)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Registro excluido' })
      dialogExcluir.value = false
      registroExcluirId.value = null
      carregarRegistros()
    })
    .catch((err) => {
      console.log(`Erro ao excluir ${props.nomeEntidade}:`, err)
      $q.notify({ type: 'negative', message: `Erro ao excluir ${props.nomeEntidade}` })
    })
    .finally(() => {
      excluindo.value = false
    })
}

function limparForm() {
  editando.value = false
  registroId.value = null
  form.value = criarFormVazio()
}

watch(
  () => props.campos,
  () => {
    if (!editando.value) form.value = criarFormVazio()
    carregarTodasOpcoes()
  },
  { deep: true },
)

onMounted(() => {
  form.value = criarFormVazio()
  carregarTodasOpcoes()
  carregarRegistros()
})
</script>

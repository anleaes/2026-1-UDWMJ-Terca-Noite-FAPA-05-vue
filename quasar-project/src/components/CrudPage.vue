<template>
  <q-page class="q-pa-lg">
    <q-btn flat label="Voltar" to="/" icon="arrow_back" class="q-mb-md" />

    <h5 class="q-my-none">{{ titulo }}</h5>
    <p class="text-grey-7 q-mb-lg">{{ descricao }}</p>

    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">
          {{ editando ? `Editar ${nomeEntidade}` : `Novo ${nomeEntidade}` }}
        </div>

        <div class="row q-col-gutter-md">
          <div
            v-for="campo in campos"
            :key="campo.name"
            :class="campo.col || colPadrao(campo)"
          >
            <q-input
              v-if="isTexto(campo)"
              v-model="form[campo.name]"
              :label="campo.label"
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
              v-else-if="campo.type === 'date'"
              v-model="form[campo.name]"
              :label="campo.label"
              mask="####-##-##"
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
              v-else-if="campo.type === 'url'"
              v-model="form[campo.name]"
              :label="campo.label"
              type="url"
              outlined
              dense
              hint="Cole o link da imagem"
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
      :title="tituloTabela"
      :rows="registros"
      :columns="colunas"
      row-key="id"
      flat
      bordered
      :no-data-label="mensagemVazia"
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
        </q-td>
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
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  nomeEntidade: { type: String, required: true },
  campos: { type: Array, required: true },
  colunas: { type: Array, required: true },
  service: { type: Object, required: true },
})

const registros = ref([])
const editando = ref(false)
const registroId = ref(null)
const form = ref(criarFormVazio())

const tituloTabela = computed(() => `${props.titulo} cadastrados`)
const mensagemVazia = computed(() => `Nenhum ${props.nomeEntidade} cadastrado`)
const colunasImagem = computed(() => props.colunas.filter((coluna) => coluna.type === 'image'))

function isTexto(campo) {
  return !campo.type || campo.type === 'text'
}

function colPadrao(campo) {
  if (campo.type === 'textarea' || campo.type === 'url') {
    return 'col-12'
  }

  return 'col-12 col-md-6'
}

function valorInicial(campo) {
  if (campo.type === 'number') return null
  if (campo.type === 'select-multiple') return []
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
  if (campo.type === 'select-multiple') return !valor || valor.length === 0
  return valor === null || valor === undefined || valor === ''
}

function montarDados() {
  const dados = {}
  props.campos.forEach((campo) => {
    const valor = form.value[campo.name]
    dados[campo.name] =
      campo.type === 'number' && valor !== null && valor !== '' ? Number(valor) : valor
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

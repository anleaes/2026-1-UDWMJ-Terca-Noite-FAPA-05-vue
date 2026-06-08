<template>
  <q-page class="q-pa-md cinema-crud-page">
    <q-btn
      v-if="backTo"
      flat
      icon="arrow_back"
      :label="backLabel"
      :to="backTo"
      class="q-mb-md"
    />

    <q-card flat bordered class="cinema-crud-card">
      <q-card-section class="row items-center justify-between q-pb-sm">
        <h1 class="text-h5 text-weight-bold q-my-none cinema-crud-card__title">
          {{ title }}
        </h1>
        <q-btn
          v-if="showNovo"
          color="primary"
          icon="add"
          :label="novoLabel"
          unelevated
          @click="onNovo"
        />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <q-table
          :rows="rows"
          :columns="tableColumns"
          :row-key="rowKey"
          :loading="loading"
          flat
          bordered
          :pagination="{ rowsPerPage: 0 }"
          hide-pagination
          :row-class="rowClass"
          class="cinema-crud-table"
          @row-click="onRowClick"
        >
          <template
            v-for="slotName in forwardedSlots"
            :key="slotName"
            #[slotName]="slotProps"
          >
            <slot :name="slotName" v-bind="slotProps" />
          </template>

          <template v-if="showDelete" #body-cell-actions="props">
            <q-td :props="props" class="cinema-crud-table__actions" @click.stop>
              <slot name="actions" :row="props.row">
                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  @click="$emit('delete', props.row)"
                />
              </slot>
            </q-td>
          </template>

          <template #no-data>
            <div class="full-width text-center q-pa-lg text-grey-6">
              {{ emptyMessage }}
            </div>
          </template>
        </q-table>
      </q-card-section>

      <slot name="after-table" />
    </q-card>

    <q-dialog
      v-if="showFormDialog"
      :model-value="showForm"
      persistent
      @update:model-value="$emit('update:showForm', $event)"
    >
      <q-card
        class="cinema-form-dialog"
        :style="{ minWidth: '320px', maxWidth: formMaxWidth, width: '100%' }"
      >
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-h6 text-weight-medium">{{ formTitle }}</div>
          <q-btn flat round dense icon="close" @click="onCancelForm" />
        </q-card-section>

        <q-separator class="q-mt-sm" />

        <q-card-section class="q-pt-md">
          <slot name="form" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default {
  name: 'BaseCrudPage',

  props: {
    title: {
      type: String,
      required: true,
    },
    backTo: {
      type: String,
      default: null,
    },
    backLabel: {
      type: String,
      default: 'Voltar',
    },
    rows: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Array,
      required: true,
    },
    rowKey: {
      type: String,
      default: 'id',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    showForm: {
      type: Boolean,
      default: false,
    },
    formTitle: {
      type: String,
      default: '',
    },
    selectedId: {
      type: [Number, String],
      default: null,
    },
    showNovo: {
      type: Boolean,
      default: true,
    },
    showDelete: {
      type: Boolean,
      default: true,
    },
    showFormDialog: {
      type: Boolean,
      default: true,
    },
    rowClickable: {
      type: Boolean,
      default: true,
    },
    novoLabel: {
      type: String,
      default: 'Novo',
    },
    emptyMessage: {
      type: String,
      default: 'Nenhum registro encontrado.',
    },
    formMaxWidth: {
      type: String,
      default: '560px',
    },
  },

  emits: ['update:showForm', 'novo', 'row-click', 'delete', 'cancel-form'],

  computed: {
    tableColumns() {
      if (!this.showDelete) {
        return this.columns
      }

      const hasActions = this.columns.some((col) => col.name === 'actions')
      if (hasActions) {
        return this.columns
      }

      return [
        ...this.columns,
        { name: 'actions', label: '', field: 'actions', align: 'right', style: 'width: 56px' },
      ]
    },

    forwardedSlots() {
      return Object.keys(this.$slots).filter(
        (name) =>
          name.startsWith('body-cell-') ||
          name === 'top' ||
          name === 'bottom' ||
          name === 'header-cell-actions'
      )
    },
  },

  methods: {
    rowClass(row) {
      const classes = []

      if (this.rowClickable && this.showFormDialog) {
        classes.push('cinema-crud-row--clickable')
      }

      if (this.selectedId != null && row[this.rowKey] == this.selectedId) {
        classes.push('cinema-crud-row--active')
      }

      return classes.join(' ')
    },

    onNovo() {
      this.$emit('novo')
    },

    onRowClick(_evt, row) {
      if (!this.rowClickable || !this.showFormDialog) {
        return
      }

      this.$emit('row-click', row)
    },

    onCancelForm() {
      this.$emit('cancel-form')
      this.$emit('update:showForm', false)
    },
  },
}
</script>

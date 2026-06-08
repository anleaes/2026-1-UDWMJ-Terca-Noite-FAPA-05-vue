<template>
  <div class="seat-map">
    <div class="seat-map__screen">
      <span>TELA</span>
    </div>

    <div class="seat-legend">
      <span class="seat-legend__item">
        <span class="seat-dot seat-dot--available" />
        Disponível
      </span>
      <span class="seat-legend__item">
        <span class="seat-dot seat-dot--selected" />
        Selecionado
      </span>
      <span class="seat-legend__item">
        <span class="seat-dot seat-dot--occupied" />
        Ocupado
      </span>
    </div>

    <q-inner-loading :showing="loading" />

    <div v-if="rows.length" class="seat-grid-wrapper">
      <div class="seat-grid">
        <div v-for="row in rows" :key="row.label" class="seat-row">
          <div class="seat-row-label">{{ row.label }}</div>
          <div class="seat-row-items">
            <button
              v-for="seat in row.seats"
              :key="seat.id"
              type="button"
              class="seat-item"
              :class="seatStateClass(seat.id)"
              :disabled="readonly || isOccupied(seat.id)"
              :aria-label="`Assento ${seat.label || seat.row + seat.number}`"
              :aria-pressed="isSelected(seat.id)"
              @click="onSeatClick(seat)"
            >
              {{ seat.number }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-else-if="!loading" class="seat-map__empty text-grey-7">
      Nenhum assento encontrado para esta sala.
    </p>
  </div>
</template>

<script>
export default {
  name: 'SeatMap',

  props: {
    seats: {
      type: Array,
      default: () => [],
    },
    occupiedIds: {
      type: Array,
      default: () => [],
    },
    selectedId: {
      type: [Number, String],
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:selectedId'],

  computed: {
    occupiedSet() {
      return new Set(this.occupiedIds.map((id) => Number(id)))
    },

    rows() {
      const byRow = {}

      this.seats.forEach((seat) => {
        const rowLabel = seat.row
        if (!byRow[rowLabel]) {
          byRow[rowLabel] = []
        }
        byRow[rowLabel].push(seat)
      })

      return Object.keys(byRow)
        .sort()
        .map((label) => ({
          label,
          seats: [...byRow[label]].sort((a, b) => a.number - b.number),
        }))
    },
  },

  methods: {
    isOccupied(seatId) {
      return this.occupiedSet.has(Number(seatId))
    },

    isSelected(seatId) {
      return Number(this.selectedId) === Number(seatId)
    },

    seatStateClass(seatId) {
      if (this.isOccupied(seatId)) {
        return 'seat-item--occupied'
      }

      if (this.isSelected(seatId)) {
        return 'seat-item--selected'
      }

      return 'seat-item--available'
    },

    onSeatClick(seat) {
      if (this.readonly || this.isOccupied(seat.id)) {
        return
      }

      if (this.isSelected(seat.id)) {
        this.$emit('update:selectedId', null)
        return
      }

      this.$emit('update:selectedId', seat.id)
    },
  },
}
</script>

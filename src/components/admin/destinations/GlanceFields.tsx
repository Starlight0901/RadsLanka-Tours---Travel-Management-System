import { MultiSelectDropdown } from '@/components/admin/destinations/MultiSelectDropdown.tsx'
import { controlClassName, hintClassName, labelClassName } from '@/components/admin/destinations/formStyles.ts'
import {
  DESTINATION_CHARACTERISTICS,
  DESTINATION_OTHER_CHARACTERISTIC_MAX,
  OTHER_CHARACTERISTIC_ID,
  SRI_LANKA_PROVINCES,
  STAY_UNITS,
  STAY_VALUE_MAX,
  districtBelongsToProvince,
  findDistrict,
  findProvince,
  isCountedStayUnit,
  isStayUnit,
  type RecommendedStay,
} from '@/config/destinationContent.ts'

type LocationFieldsProps = {
  province: string
  district: string
  onChange: (value: { province: string; district: string }) => void
}

export function LocationFields({ province, district, onChange }: LocationFieldsProps) {
  const selectedProvince = findProvince(province)
  const provinces: readonly (typeof SRI_LANKA_PROVINCES)[number][] = selectedProvince
    ? [selectedProvince]
    : SRI_LANKA_PROVINCES

  function changeProvince(nextProvince: string) {
    onChange({
      province: nextProvince,
      district: district && districtBelongsToProvince(district, nextProvince) ? district : '',
    })
  }

  function changeDistrict(nextDistrict: string) {
    onChange({
      province: nextDistrict ? (findDistrict(nextDistrict)?.province.id ?? province) : province,
      district: nextDistrict,
    })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="destination-province" className={labelClassName}>
          Province
        </label>
        <select
          id="destination-province"
          className={controlClassName}
          value={province}
          onChange={(event) => changeProvince(event.target.value)}
        >
          <option value="">Not set</option>
          {SRI_LANKA_PROVINCES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="destination-district" className={labelClassName}>
          District
        </label>
        <select
          id="destination-district"
          className={controlClassName}
          value={district}
          onChange={(event) => changeDistrict(event.target.value)}
        >
          <option value="">Not set</option>
          {provinces.map((item) =>
            selectedProvince ? (
              item.districts.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))
            ) : (
              <optgroup key={item.id} label={item.label}>
                {item.districts.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </optgroup>
            ),
          )}
        </select>
        <p className={hintClassName}>
          {selectedProvince
            ? `Showing districts in ${selectedProvince.label}.`
            : 'Choosing a district also sets its province.'}
        </p>
      </div>
    </div>
  )
}

type RecommendedStayFieldProps = {
  value: RecommendedStay | null
  onChange: (value: RecommendedStay | null) => void
}

export function RecommendedStayField({ value, onChange }: RecommendedStayFieldProps) {
  const counted = value ? isCountedStayUnit(value.unit) : false

  function changeUnit(unit: string) {
    if (!isStayUnit(unit)) {
      onChange(null)
      return
    }
    onChange(isCountedStayUnit(unit) ? { unit, value: value?.value ?? 1 } : { unit, value: null })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="destination-stay-unit" className={labelClassName}>
          Length of stay
        </label>
        <select
          id="destination-stay-unit"
          className={controlClassName}
          value={value?.unit ?? ''}
          onChange={(event) => changeUnit(event.target.value)}
        >
          <option value="">Not set</option>
          {STAY_UNITS.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.label}
            </option>
          ))}
        </select>
      </div>
      {value && counted ? (
        <div>
          <label htmlFor="destination-stay-value" className={labelClassName}>
            Number of {value.unit}
          </label>
          <select
            id="destination-stay-value"
            className={controlClassName}
            value={value.value ?? 1}
            onChange={(event) => onChange({ unit: value.unit, value: Number(event.target.value) })}
          >
            {Array.from({ length: STAY_VALUE_MAX }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>
                {count} {value.unit === 'days' ? (count === 1 ? 'day' : 'days') : count === 1 ? 'night' : 'nights'}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  )
}

type CharacteristicsFieldProps = {
  labelId: string
  selected: string[]
  other: string
  onChange: (value: { characteristics: string[]; characteristicOther: string }) => void
}

export function CharacteristicsField({ labelId, selected, other, onChange }: CharacteristicsFieldProps) {
  const otherSelected = selected.includes(OTHER_CHARACTERISTIC_ID)

  function changeSelected(next: string[]) {
    onChange({
      characteristics: next,
      characteristicOther: next.includes(OTHER_CHARACTERISTIC_ID) ? other : '',
    })
  }

  return (
    <div>
      <MultiSelectDropdown
        labelId={labelId}
        options={DESTINATION_CHARACTERISTICS.map((item) => ({ value: item.id, label: item.label }))}
        selected={selected}
        onChange={changeSelected}
        placeholder="Choose destination types"
      />
      {otherSelected ? (
        <div className="mt-3">
          <label htmlFor="destination-characteristic-other" className={labelClassName}>
            Other destination type
          </label>
          <input
            id="destination-characteristic-other"
            type="text"
            value={other}
            maxLength={DESTINATION_OTHER_CHARACTERISTIC_MAX}
            placeholder="e.g. Ayurveda & wellness"
            className={controlClassName}
            onChange={(event) => onChange({ characteristics: selected, characteristicOther: event.target.value })}
          />
        </div>
      ) : null}
    </div>
  )
}

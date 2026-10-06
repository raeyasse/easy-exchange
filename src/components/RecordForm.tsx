import { useState, type FormEvent, type ReactNode } from 'react'
import { CONDITIONS, GENRES, validateRecordFields } from '../data'
import type { FieldErrors, RecordFields } from '../data'

export const EMPTY_FIELDS: RecordFields = {
  artist: '',
  title: '',
  year: '',
  condition: '',
  genre: '',
  notes: '',
}

type Props = {
  initial: RecordFields
  submitLabel: string
  onSubmit: (fields: RecordFields) => void
}

export function RecordForm({ initial, submitLabel, onSubmit }: Props) {
  const [fields, setFields] = useState<RecordFields>(initial)
  const [errors, setErrors] = useState<FieldErrors>({})

  function update(name: keyof RecordFields, value: string) {
    setFields((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateRecordFields(fields)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) onSubmit(fields)
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <Field label="Artist" error={errors.artist}>
        <input value={fields.artist} onChange={(e) => update('artist', e.target.value)} />
      </Field>
      <Field label="Album title" error={errors.title}>
        <input value={fields.title} onChange={(e) => update('title', e.target.value)} />
      </Field>
      <Field label="Year (optional)" error={errors.year}>
        <input
          inputMode="numeric"
          value={fields.year}
          onChange={(e) => update('year', e.target.value)}
        />
      </Field>
      <Field label="Condition" error={errors.condition}>
        <select value={fields.condition} onChange={(e) => update('condition', e.target.value)}>
          <option value="">Choose condition</option>
          {CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Genre" error={errors.genre}>
        <select value={fields.genre} onChange={(e) => update('genre', e.target.value)}>
          <option value="">Choose genre</option>
          {GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </Field>
      <Field label={`Notes (optional, ${fields.notes.length}/300)`} error={errors.notes}>
        <textarea rows={4} value={fields.notes} onChange={(e) => update('notes', e.target.value)} />
      </Field>
      <button type="submit" className="button">
        {submitLabel}
      </button>
    </form>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className={error ? 'field field-error' : 'field'}>
      <span>{label}</span>
      {children}
      {error ? <span className="error">{error}</span> : null}
    </label>
  )
}

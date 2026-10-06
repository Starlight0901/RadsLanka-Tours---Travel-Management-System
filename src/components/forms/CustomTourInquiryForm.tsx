import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { DestinationMultiSelect } from '@/components/forms/DestinationMultiSelect.tsx'
import { fieldControlClass } from '@/components/forms/fieldStyles.ts'
import { FormError } from '@/components/forms/FormError.tsx'
import { Button } from '@/components/ui/Button.tsx'
import { ErrorState } from '@/components/ui/ErrorState.tsx'
import { isFirebaseConfigured } from '@/config/env.ts'
import { listInquiryDestinations, type DestinationRecord } from '@/services/firebase/destinations.ts'
import { createCustomTourInquiry } from '@/services/firebase/inquiries.ts'
import { cn } from '@/utils/cn.ts'

const guestOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16+']

const inquirySchema = z
  .object({
    name: z.string().trim().min(1, 'Enter your name').max(120),
    email: z.string().trim().email('Enter a valid email address'),
    phone: z.string().trim().min(7, 'Enter your number').max(40),
    travelDate: z.string().min(1, 'Select your travel start date'),
    returnDate: z.string().min(1, 'Select your travel end date'),
    guests: z.string().min(1, 'Select the number of guests'),
    destinationIds: z.array(z.string()),
    otherSelected: z.boolean(),
    otherDestination: z.string().max(120),
    message: z.string().max(4000).optional(),
  })
  .superRefine((value, context) => {
    if (value.returnDate && value.travelDate && value.returnDate < value.travelDate) {
      context.addIssue({
        code: 'custom',
        path: ['returnDate'],
        message: 'End date must be on or after the start date',
      })
    }

    const hasSelected = value.destinationIds.length > 0
    const hasOther = value.otherSelected && value.otherDestination.trim().length > 0

    if (!hasSelected && !hasOther) {
      context.addIssue({
        code: 'custom',
        path: ['destinationIds'],
        message: 'Select at least one destination or enter another location',
      })
    }

    if (value.otherSelected && value.otherDestination.trim().length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['otherDestination'],
        message: 'Enter your preferred location',
      })
    }
  })

type InquiryValues = z.infer<typeof inquirySchema>

const fieldClass = fieldControlClass

type CustomTourInquiryFormProps = {
  className?: string
}

export function CustomTourInquiryForm({ className }: CustomTourInquiryFormProps) {
  const [destinations, setDestinations] = useState<DestinationRecord[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      travelDate: '',
      returnDate: '',
      guests: '',
      destinationIds: [],
      otherSelected: false,
      otherDestination: '',
      message: '',
    },
  })

  useEffect(() => {
    let active = true

    async function loadDestinations() {
      try {
        const records = await listInquiryDestinations()
        if (active) {
          setDestinations(records)
        }
      } catch {
        if (active) {
          setDestinations([])
        }
      }
    }

    void loadDestinations()
    return () => {
      active = false
    }
  }, [])

  async function onSubmit(values: InquiryValues) {
    setSubmitError(null)
    setSuccess(false)

    const selected = destinations.filter((item) => values.destinationIds.includes(item.id))
    const otherDestination = values.otherSelected ? values.otherDestination.trim() : ''
    const destinationNames = selected.map((item) => item.name)
    if (otherDestination) {
      destinationNames.push(otherDestination)
    }

    try {
      await createCustomTourInquiry({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        travelDate: values.travelDate,
        returnDate: values.returnDate,
        travellers: values.guests === '16+' ? 16 : Number(values.guests),
        destinations: destinationNames,
        destinationIds: values.destinationIds,
        otherDestination: otherDestination || undefined,
        message: values.message?.trim() ?? '',
      })
      reset()
      setSuccess(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to send your inquiry.')
    }
  }

  return (
    <form
      className={cn('rounded-2xl bg-white p-5 text-left text-slate-900 shadow-lg sm:p-7', className)}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {!isFirebaseConfigured ? (
        <div className="mb-5">
          <ErrorState
            title="Inquiries are not connected yet"
            message="Firebase is not configured. The form is ready, but submissions cannot be stored until .env.local is set up."
          />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="inquiry-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Your Name
          </label>
          <input
            id="inquiry-name"
            type="text"
            autoComplete="name"
            placeholder="Enter your name"
            className={fieldClass}
            disabled={isSubmitting}
            {...register('name')}
          />
          <FormError message={errors.name?.message} />
        </div>
        <div>
          <label htmlFor="inquiry-email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <input
            id="inquiry-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            className={fieldClass}
            disabled={isSubmitting}
            {...register('email')}
          />
          <FormError message={errors.email?.message} />
        </div>
        <div>
          <label htmlFor="inquiry-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
            Phone / WhatsApp
          </label>
          <input
            id="inquiry-phone"
            type="tel"
            autoComplete="tel"
            placeholder="Enter your number"
            className={fieldClass}
            disabled={isSubmitting}
            {...register('phone')}
          />
          <FormError message={errors.phone?.message} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Travel Dates</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="inquiry-travel-date" className="sr-only">
                Start date
              </label>
              <input
                id="inquiry-travel-date"
                type="date"
                className={fieldClass}
                disabled={isSubmitting}
                {...register('travelDate')}
              />
            </div>
            <div>
              <label htmlFor="inquiry-return-date" className="sr-only">
                End date
              </label>
              <input
                id="inquiry-return-date"
                type="date"
                className={fieldClass}
                disabled={isSubmitting}
                {...register('returnDate')}
              />
            </div>
          </div>
          <FormError message={errors.travelDate?.message ?? errors.returnDate?.message} />
        </div>
        <div>
          <label htmlFor="inquiry-guests" className="mb-1.5 block text-sm font-medium text-slate-700">
            Number of Guests
          </label>
          <select id="inquiry-guests" className={fieldClass} disabled={isSubmitting} {...register('guests')}>
            <option value="">Select guests</option>
            {guestOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <FormError message={errors.guests?.message} />
        </div>
        <Controller
          name="destinationIds"
          control={control}
          render={({ field }) => (
            <Controller
              name="otherSelected"
              control={control}
              render={({ field: otherSelectedField }) => (
                <Controller
                  name="otherDestination"
                  control={control}
                  render={({ field: otherField }) => (
                    <DestinationMultiSelect
                      options={destinations.map((item) => ({ id: item.id, name: item.name }))}
                      selectedIds={field.value}
                      otherSelected={otherSelectedField.value}
                      otherValue={otherField.value}
                      error={errors.destinationIds?.message}
                      otherError={errors.otherDestination?.message}
                      disabled={isSubmitting}
                      onSelectedIdsChange={field.onChange}
                      onOtherSelectedChange={otherSelectedField.onChange}
                      onOtherValueChange={otherField.onChange}
                    />
                  )}
                />
              )}
            />
          )}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="inquiry-message" className="mb-1.5 block text-sm font-medium text-slate-700">
          Additional Requirements (Optional)
        </label>
        <textarea
          id="inquiry-message"
          rows={5}
          placeholder="Tell us about your requirements..."
          className={`${fieldClass} resize-y`}
          disabled={isSubmitting}
          {...register('message')}
        />
        <FormError message={errors.message?.message} />
      </div>

      {submitError ? (
        <div className="mt-4">
          <ErrorState title="Inquiry not sent" message={submitError} />
        </div>
      ) : null}

      {success ? (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          Thank you. Your inquiry has been received and we will contact you soon.
        </p>
      ) : null}

      <div className="mt-5">
        <Button
          type="submit"
          className="w-full rounded-lg !bg-emerald-700 !text-white hover:!bg-emerald-600 sm:w-auto sm:px-10"
          disabled={!isFirebaseConfigured || isSubmitting}
        >
          {isSubmitting ? 'Sending…' : 'SEND INQUIRY'}
        </Button>
      </div>
    </form>
  )
}

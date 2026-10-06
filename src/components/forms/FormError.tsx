type FormErrorProps = {
  message?: string
  id?: string
}

export function FormError({ message, id }: FormErrorProps) {
  if (!message) {
    return null
  }

  return (
    <p id={id} className="mt-1.5 text-sm text-red-700">
      {message}
    </p>
  )
}

export function validateInput(input: FormDataEntryValue | null) {
  if (typeof input !== 'string') {
    throw new Error('Invalid payload')
  }
  return input
}

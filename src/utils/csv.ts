import Papa from 'papaparse'

export interface ParsedBook {
  title: string
  author: string
  isSample: boolean
}

export interface CSVParseResult {
  valid: ParsedBook[]
  invalid: number
  errors: string[]
}

/**
 * Parse CSV content for book import
 * Expected format: title,author,isSample
 */
export function parseBookCSV(csvContent: string): CSVParseResult {
  const result: CSVParseResult = {
    valid: [],
    invalid: 0,
    errors: [],
  }

  if (!csvContent.trim()) {
    result.errors.push('CSV content is empty')
    return result
  }

  // Note: transformHeader lowercases all headers, so field access below
  // uses lowercase names (e.g., 'issample' not 'isSample')
  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
  })

  // Check for required headers
  const headers = parsed.meta.fields || []
  const hasTitle = headers.includes('title')
  const hasAuthor = headers.includes('author')

  if (!hasTitle || !hasAuthor) {
    result.errors.push(
      `Missing required headers. Expected: title, author, isSample. Found: ${headers.join(', ')}`,
    )
    return result
  }

  // Process rows
  for (const row of parsed.data) {
    const title = row.title?.trim()
    const author = row.author?.trim()
    const isSampleValue = row.issample?.trim().toLowerCase()

    // Validate required fields
    if (!title || !author) {
      result.invalid++
      continue
    }

    // Parse isSample (default to false)
    const isSample = isSampleValue === 'true' || isSampleValue === '1'

    result.valid.push({ title, author, isSample })
  }

  // Add parsing errors if any
  if (parsed.errors.length > 0) {
    for (const error of parsed.errors) {
      result.errors.push(`Row ${error.row}: ${error.message}`)
    }
  }

  return result
}

/**
 * Generate a sample CSV template
 */
export function getCSVTemplate(): string {
  return `title,author,isSample
"The Great Gatsby","F. Scott Fitzgerald",false
"1984","George Orwell",true
"To Kill a Mockingbird","Harper Lee",false`
}

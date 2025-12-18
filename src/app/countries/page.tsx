'use client'

import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      code
      name
      emoji
    }
  }
`

export default function CountriesPage() {
  const { data, loading, error } = useQuery(GET_COUNTRIES)

  if (loading) return <p className="p-6">Loading...</p>
  if (error) return <p className="p-6">Error: {error.message}</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Countries</h1>
      <ul className="space-y-1">
        {data?.countries.map((country) => (
          <li key={country.code}>
            {country.emoji} {country.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

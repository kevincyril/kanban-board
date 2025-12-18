import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'https://countries.trevorblades.com/',
  documents: ['src/graphql/**/*.graphql'],
  generates: {
    'src/graphql/__generated__/': {
      preset: 'client',
      plugins: [],
    },
  },
}

export default config

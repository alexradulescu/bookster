import { Component, type ReactNode } from 'react'
import { Container, Title, Text, Button, Stack } from '@mantine/core'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container size="sm" py="xl">
          <Stack align="center" gap="md">
            <Title order={2}>Something went wrong</Title>
            <Text c="dimmed" ta="center">
              An unexpected error occurred. Please try refreshing the page.
            </Text>
            {this.state.error && (
              <Text size="sm" c="red" ta="center">
                {this.state.error.message}
              </Text>
            )}
            <Button onClick={this.handleReset}>Refresh Page</Button>
          </Stack>
        </Container>
      )
    }

    return this.props.children
  }
}

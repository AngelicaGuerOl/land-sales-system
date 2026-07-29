import { AuthLayout } from '../../../../shared/ui/layout/AuthLayout'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}

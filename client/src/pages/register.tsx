import React from 'react'
import { Form, Formik } from 'formik'
import { Box, Button } from '@chakra-ui/core'
import { Wrapper } from '../components/Wrapper'
import { InputField } from '../components/InputField'
import { useRegisterMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { useRouter } from 'next/router'
import { NavBar } from '../components/NavBar'
import { FormShaper } from '../components/FormShaper'

export const Register: React.FC = ({}) => {
    const router = useRouter()
    const [, register] = useRegisterMutation()

    return (
        <>
            <NavBar />
            <FormShaper>
                <Wrapper variant='regular'>
                    <Formik
                        initialValues={{ email: '', username: '', password: '' }}
                        onSubmit={async (values, { setErrors }) => {
                            const response = await register(values)
                            if (response.data?.register.errors) {
                                setErrors(toErrorMap(response.data.register.errors))
                            } else if (response.data?.register.user) {
                                router.push('/')
                            }
                        }}>
                        {({ isSubmitting }) => (
                            <Form>
                                <InputField name='email' label='email' placeholder='email' />
                                <InputField name='username' label='username' placeholder='username' />
                                <Box mt={4}>
                                    <InputField
                                        name='password'
                                        label='password'
                                        placeholder='password'
                                        type='password'
                                    />
                                </Box>
                                <Button mt={4} isLoading={isSubmitting} variantColor='teal' type='submit'>
                                    register
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Wrapper>
            </FormShaper>
        </>
    )
}

export default Register

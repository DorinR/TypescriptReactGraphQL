import { FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/core'
import React, { InputHTMLAttributes } from 'react'
import { useField } from 'formik'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string
    name: string
}

export const InputField: React.FC<InputFieldProps> = ({ label, size: _, ...props }) => {
    const [field, { error }] = useField(props)

    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            <Input {...field} {...props} id={field.name} />
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    )
}

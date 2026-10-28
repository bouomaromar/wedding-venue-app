import { useCallback, useState } from "react";

// Form state for React Native inputs.
// Usage: <TextInput value={form.email} onChangeText={handleChange("email")} />
const useForm = (initialValues) => {
    const [form, setForm] = useState(initialValues);

    const handleChange = useCallback(
        (name) => (value) => setForm((prev) => ({ ...prev, [name]: value })),
        []
    );

    return { form, setForm, handleChange };
};

export default useForm;

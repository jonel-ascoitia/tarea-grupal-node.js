export const validatorCompiler = ({ schema, method, url, httpPart }) => {
    return (data) => {
        try {
            const parsed = schema.parse(data);
            return { value: parsed };
        } catch (err) {
            return { error: err };
        }
    };
};

export const serializerCompiler = ({ schema, method, url, httpStatus, contentType }) => {
    return (data) => {
        return JSON.stringify(data);
    };
};

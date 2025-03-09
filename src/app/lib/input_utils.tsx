const isNumber = (value: string) => {
    return !isNaN(parseInt(value));
}

export { isNumber };
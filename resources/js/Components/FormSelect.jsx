import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function FormSelect(
    { className = '', isFocused = false, children, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <select
            {...props}
            className={
                'rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 ' +
                className
            }
            ref={localRef}
        >
            {children}
        </select>
    );
});

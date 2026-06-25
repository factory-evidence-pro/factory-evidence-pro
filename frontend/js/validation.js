/**
 * Form Validation
 */

export function validateForm() {
    const errors = [];

    const sku = document.getElementById('sku').value.trim();
    const boxCode = document.getElementById('boxCode').value.trim();
    const quantity = document.getElementById('quantity').value.trim();
    const fclDate = document.getElementById('fclDate').value;
    const chinaDate = document.getElementById('chinaDate').value;

    if (!sku) errors.push({ field: 'sku', message: 'SKU is required' });
    if (!boxCode) errors.push({ field: 'boxCode', message: 'Box Code is required' });
    if (!quantity || parseInt(quantity) < 1) {
        errors.push({ field: 'quantity', message: 'Quantity must be at least 1' });
    }
    if (!fclDate) errors.push({ field: 'fclDate', message: 'FCL Date is required' });
    if (!chinaDate) errors.push({ field: 'chinaDate', message: 'China Date is required' });

    return {
        isValid: errors.length === 0,
        errors
    };
}

export function showErrors(errors) {
    // Highlight fields with errors
    document.querySelectorAll('.form-group').forEach(group => {
        group.style.borderColor = '';
    });

    errors.forEach(error => {
        const field = document.getElementById(error.field);
        if (field) {
            field.style.borderColor = '#e53e3e';
            const group = field.closest('.form-group');
            if (group) {
                group.style.borderColor = '#e53e3e';
                group.style.borderWidth = '2px';
                group.style.borderStyle = 'solid';
            }
        }
    });
}
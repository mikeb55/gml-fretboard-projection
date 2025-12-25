async function generateAsync() {
    await new Promise(resolve => setTimeout(resolve, 10));
    return { success: true };
}

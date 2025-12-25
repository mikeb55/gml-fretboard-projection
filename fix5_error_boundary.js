function safeGenerate() {
    try {
        return generate();
    } catch (e) {
        console.error('Generation failed:', e);
        return { error: e.message, fallback: true };
    }
}

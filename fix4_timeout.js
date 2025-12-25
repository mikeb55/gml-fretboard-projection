function generateWithTimeout(func, timeoutMs = 5000) {
    return Promise.race([
        func(),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        )
    ]);
}

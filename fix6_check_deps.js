function checkAllDependencies() {
    const required = ['EnhancedStructureGenerator', 'ProgressionEngine', 'ExtendedVoiceLeading'];
    const missing = required.filter(dep => typeof window[dep] === 'undefined');
    return missing.length === 0;
}

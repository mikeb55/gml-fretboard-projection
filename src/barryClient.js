/**
 * Barry Engine Integration Layer
 * 
 * This module provides a thin abstraction layer for communicating with the Barry engine
 * (mikeb55/grand-criteria-of-excellence-jazz). It handles serialization, deserialization,
 * and transport details, allowing the rest of the codebase to consume Barry's outputs
 * without knowing implementation details.
 * 
 * The Barry engine is the authoritative source for:
 * - Jazz harmony rules and evaluation logic
 * - "Grand Criteria of Excellence" scoring
 * - Voicing selection and optimization
 * - Phrase evaluation and suggestions
 * 
 * This layer does NOT implement any of Barry's rules - it only consumes Barry's outputs.
 */

/**
 * @typedef {Object} EngineVoicing
 * @property {number[]} voicing - MIDI note numbers (e.g. [48, 52, 55, 59])
 * @property {string} inversion - Inversion type ('root', '1st', '2nd', '3rd')
 * @property {string} registerPosition - Register band ('low', 'mid', 'high')
 * @property {boolean} hold - Whether to hold this voicing (visual stillness)
 * @property {Array<{code: string, message?: string}>} reasonCodes - Explanatory tags from Barry
 */

/**
 * @typedef {Object} EnginePhrase
 * @property {EngineVoicing[]} voicings - Array of voicings in the phrase
 * @property {Object} metadata - Phrase-level metadata (key, time signature, etc.)
 * @property {Array<{code: string, message?: string}>} reasonCodes - Phrase-level reason codes
 */

/**
 * @typedef {Object} BarryContext
 * @property {string} keyRoot - Root note of the key (e.g. 'C', 'F#')
 * @property {string} mode - Mode ('major', 'minor', etc.)
 * @property {string[]} chordSymbols - Array of chord symbols (e.g. ['Cmaj7', 'Dm7', 'G7'])
 * @property {Object} options - Additional options (register preferences, style, etc.)
 */

/**
 * Barry Engine Client
 * 
 * Provides a clean interface for calling the Barry engine and receiving
 * evaluated voicings and phrases. Transport mechanism is configurable
 * (HTTP API, local import, shared package, etc.).
 */
export class BarryClient {
  /**
   * @param {Object} config - Configuration options
   * @param {Function} config.transport - Transport function (default: local import)
   * @param {string} config.enginePath - Path to Barry engine (if using import)
   * @param {string} config.apiUrl - API URL (if using HTTP)
   */
  constructor(config = {}) {
    this.config = {
      transport: config.transport || 'import',
      enginePath: config.enginePath || null,
      apiUrl: config.apiUrl || null,
      ...config
    };
    
    // Lazy-loaded engine instance
    this._engine = null;
  }

  /**
   * Get evaluated voicings from Barry engine
   * 
   * @param {BarryContext} context - Context for voicing evaluation
   * @returns {Promise<EngineVoicing[]>} Array of evaluated voicings
   */
  async getEvaluatedVoicings(context) {
    try {
      const rawOutput = await this._callBarry('evaluateVoicings', context);
      return this._deserializeVoicings(rawOutput);
    } catch (error) {
      console.error('Barry engine error:', error);
      throw new Error(`Failed to get evaluated voicings: ${error.message}`);
    }
  }

  /**
   * Get evaluated phrases from Barry engine
   * 
   * @param {BarryContext} context - Context for phrase evaluation
   * @returns {Promise<EnginePhrase[]>} Array of evaluated phrases
   */
  async getEvaluatedPhrases(context) {
    try {
      const rawOutput = await this._callBarry('evaluatePhrases', context);
      return this._deserializePhrases(rawOutput);
    } catch (error) {
      console.error('Barry engine error:', error);
      throw new Error(`Failed to get evaluated phrases: ${error.message}`);
    }
  }

  /**
   * Internal method to call Barry engine via configured transport
   * 
   * @private
   * @param {string} method - Method name ('evaluateVoicings', 'evaluatePhrases')
   * @param {BarryContext} context - Context data
   * @returns {Promise<any>} Raw output from Barry
   */
  async _callBarry(method, context) {
    const serializedContext = this._serializeContext(context);
    
    switch (this.config.transport) {
      case 'import':
        return await this._callViaImport(method, serializedContext);
      case 'http':
        return await this._callViaHttp(method, serializedContext);
      case 'mock':
        return await this._callViaMock(method, serializedContext);
      default:
        throw new Error(`Unknown transport: ${this.config.transport}`);
    }
  }

  /**
   * Call Barry via local import (default)
   * 
   * @private
   */
  async _callViaImport(method, context) {
    if (!this._engine) {
      // Lazy load the engine
      if (this.config.enginePath) {
        this._engine = await import(this.config.enginePath);
      } else {
        // Try to import from a default location
        // In a real setup, this would point to the Barry engine package
        throw new Error(
          'Barry engine path not configured. ' +
          'Set config.enginePath or use a different transport.'
        );
      }
    }
    
    if (typeof this._engine[method] !== 'function') {
      throw new Error(`Barry engine does not export method: ${method}`);
    }
    
    return await this._engine[method](context);
  }

  /**
   * Call Barry via HTTP API
   * 
   * @private
   */
  async _callViaHttp(method, context) {
    if (!this.config.apiUrl) {
      throw new Error('API URL not configured for HTTP transport');
    }
    
    const response = await fetch(`${this.config.apiUrl}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(context),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Call Barry via mock (for testing/development)
   * 
   * @private
   */
  async _callViaMock(method, context) {
    // Mock implementation for development/testing
    // Returns sample voicings based on chord symbols
    if (method === 'evaluateVoicings') {
      return this._generateMockVoicings(context);
    } else if (method === 'evaluatePhrases') {
      return this._generateMockPhrases(context);
    }
    throw new Error(`Unknown method: ${method}`);
  }

  /**
   * Serialize context for Barry engine
   * 
   * @private
   * @param {BarryContext} context - Context to serialize
   * @returns {Object} Serialized context
   */
  _serializeContext(context) {
    return {
      keyRoot: context.keyRoot || 'C',
      mode: context.mode || 'major',
      chordSymbols: context.chordSymbols || [],
      options: context.options || {},
    };
  }

  /**
   * Deserialize voicings from Barry output
   * 
   * @private
   * @param {any} rawOutput - Raw output from Barry
   * @returns {EngineVoicing[]} Deserialized voicings
   */
  _deserializeVoicings(rawOutput) {
    if (!Array.isArray(rawOutput)) {
      throw new Error('Barry engine returned non-array for voicings');
    }
    
    return rawOutput.map(item => ({
      voicing: item.voicing || item.notes || [],
      inversion: item.inversion || 'root',
      registerPosition: item.registerPosition || item.register || 'mid',
      hold: item.hold || false,
      reasonCodes: item.reasonCodes || item.reasons || [],
    }));
  }

  /**
   * Deserialize phrases from Barry output
   * 
   * @private
   * @param {any} rawOutput - Raw output from Barry
   * @returns {EnginePhrase[]} Deserialized phrases
   */
  _deserializePhrases(rawOutput) {
    if (!Array.isArray(rawOutput)) {
      throw new Error('Barry engine returned non-array for phrases');
    }
    
    return rawOutput.map(item => ({
      voicings: this._deserializeVoicings(item.voicings || []),
      metadata: item.metadata || {},
      reasonCodes: item.reasonCodes || item.reasons || [],
    }));
  }

  /**
   * Generate mock voicings for testing (simple chord symbol to voicing mapping)
   * 
   * @private
   */
  _generateMockVoicings(context) {
    // Simple mock: convert chord symbols to basic voicings
    // In production, this would never be used - Barry engine provides real voicings
    const chordToVoicing = {
      'Cmaj7': { voicing: [48, 52, 55, 59], inversion: 'root' },
      'Dm7': { voicing: [50, 53, 57, 60], inversion: 'root' },
      'G7': { voicing: [55, 59, 62, 65], inversion: 'root' },
      'Am7': { voicing: [45, 48, 52, 55], inversion: 'root' },
      'Fmaj7': { voicing: [53, 57, 60, 64], inversion: 'root' },
    };
    
    return context.chordSymbols.map((symbol, index) => {
      const base = chordToVoicing[symbol] || { voicing: [48, 52, 55, 59], inversion: 'root' };
      return {
        ...base,
        registerPosition: 'mid',
        hold: index > 0 && context.chordSymbols[index] === context.chordSymbols[index - 1],
        reasonCodes: [{ code: 'MOCK_VOICING', message: 'Mock voicing for development' }],
      };
    });
  }

  /**
   * Generate mock phrases for testing
   * 
   * @private
   */
  _generateMockPhrases(context) {
    const voicings = this._generateMockVoicings(context);
    return [{
      voicings,
      metadata: {
        keyRoot: context.keyRoot,
        mode: context.mode,
      },
      reasonCodes: [{ code: 'MOCK_PHRASE', message: 'Mock phrase for development' }],
    }];
  }
}

/**
 * Create a Barry client instance with default configuration
 * 
 * @param {Object} config - Optional configuration
 * @returns {BarryClient} Configured Barry client
 */
export function createBarryClient(config = {}) {
  return new BarryClient(config);
}

/**
 * Default export
 */
export default BarryClient;


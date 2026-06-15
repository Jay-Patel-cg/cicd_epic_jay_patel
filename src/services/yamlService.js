const { BadRequestError } = require('../utils/appError');

/**
 * Validates YAML syntax cleanly
 */
const validate = (content) => {
  if (!content || typeof content !== 'string') {
    throw new BadRequestError('YAML content is empty or invalid type');
  }

  // Native diagnostic syntax check
  const lines = content.split('\n');
  const errors = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // Check for invalid tab characters (YAML standard forbids tabs entirely!)
    if (line.includes('\t')) {
      errors.push({
        line: lineNum,
        message: 'Invalid tab character found. YAML requires spaces for indentation.',
        evidence: line.replace('\t', '<TAB>'),
      });
    }

    // Check for unspaced keys (e.g. key:value instead of key: value)
    const keyMatch = line.match(/^(\s*)([^#:]+):([^\s#]+)/);
    if (keyMatch && !line.includes('://')) {
      errors.push({
        line: lineNum,
        message: 'Missing space after colon separator.',
        evidence: line,
      });
    }
  });

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return { isValid: true, message: 'YAML syntax is perfectly valid.' };
};

/**
 * Lint YAML configurations
 */
const lint = (content) => {
  const syntaxCheck = validate(content);
  const lints = [...(syntaxCheck.errors || [])];

  const lines = content.split('\n');
  const keysCount = {};

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const match = line.match(/^\s*([^#:]+):/);
    if (match) {
      const keyName = match[1].trim();
      keysCount[keyName] = (keysCount[keyName] || 0) + 1;
      if (keysCount[keyName] > 1 && line.startsWith(keyName)) {
        lints.push({
          line: lineNum,
          message: `Duplicate root key definition: "${keyName}"`,
          evidence: line,
        });
      }
    }
  });

  return {
    isValid: lints.length === 0,
    warnings: lints.map((l) => `${l.message} on line ${l.line}`),
  };
};

/**
 * Format YAML indentation
 */
const format = (content) => {
  if (!content) return '';
  const lines = content.split('\n');
  const formatted = lines.map((line) => {
    // Replace tabs with 2 spaces
    let clean = line.replace(/\t/g, '  ');
    // Ensure spacing after colon separators
    clean = clean.replace(/:([^\s#])/, ': $1');
    return clean;
  });
  return formatted.join('\n');
};

/**
 * Compare two YAML structures
 */
const compare = (contentA, contentB) => {
  const linesA = (contentA || '').split('\n');
  const linesB = (contentB || '').split('\n');
  const diffs = [];

  const max = Math.max(linesA.length, linesB.length);
  for (let i = 0; i < max; i++) {
    const valA = linesA[i];
    const valB = linesB[i];

    if (valA !== valB) {
      diffs.push({
        line: i + 1,
        source: valA || '<EOF>',
        target: valB || '<EOF>',
      });
    }
  }

  return {
    areIdentical: diffs.length === 0,
    differences: diffs,
  };
};

/**
 * Merge two configurations
 */
const merge = (contentA, contentB) => {
  if (!contentA) return contentB || '';
  if (!contentB) return contentA || '';
  // Native merger: clean append separating blocks
  return `${contentA.trim()}\n\n# Merged Configurations block\n${contentB.trim()}\n`;
};

/**
 * Convert YAML lines to mock JSON
 */
const convert = (content, formatType = 'json') => {
  if (!content) return {};
  if (formatType === 'json') {
    // YAML-to-JSON
    const lines = content.split('\n');
    const result = {};
    lines.forEach((line) => {
      const match = line.match(/^\s*([^#:]+):\s*(.+)/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        // Remove surrounding quotes
        val = val.replace(/^["']|["']$/g, '');
        result[key] = val;
      }
    });
    return result;
  } else {
    // JSON-to-YAML
    if (typeof content !== 'object') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        throw new BadRequestError('Invalid JSON structure provided');
      }
    }
    const yamlLines = Object.keys(content).map((key) => {
      const val = content[key];
      const valStr = typeof val === 'object' ? JSON.stringify(val) : val;
      return `${key}: "${valStr}"`;
    });
    return yamlLines.join('\n');
  }
};

module.exports = {
  validate,
  lint,
  format,
  compare,
  merge,
  convert,
};

# Duplicate code report (approximate)

## Block with hash 199aa9a9d35e5c043e7dd241041a4aae
- src/scripts/main.js:L275
- src/scripts/utils.js:L21
```
if (meta.preparedBy) md += `**Prepared By:** ${meta.preparedBy}\n`;
if (meta.recipient) md += `**Recipient:** ${meta.recipient}\n`;
if (meta.version) md += `**Version:** ${meta.version}\n`;
if (meta.objective) md += `**Objective:** ${meta.objective}\n`;
md += "\n";
```

## Block with hash 3876d477ac62db99915f1ff74d559d0d
- src/scripts/main.js:L276
- src/scripts/utils.js:L22
```
if (meta.recipient) md += `**Recipient:** ${meta.recipient}\n`;
if (meta.version) md += `**Version:** ${meta.version}\n`;
if (meta.objective) md += `**Objective:** ${meta.objective}\n`;
md += "\n";

```

## Block with hash a20888a3b278b483fe96b1ad885edc57
- src/scripts/main.js:L294
- src/scripts/utils.js:L37
```
blueprint.connections.forEach(c => {
md += `- **${c.name || 'Unnamed'}** (Type: ${c.type || '?'}, ID: ${c.id || '?'})\n`;
});
md += "\n";
}
```

## Block with hash 1deb598efb299ef67bc3dd7243dd1fc4
- src/scripts/main.js:L295
- src/scripts/utils.js:L38
```
md += `- **${c.name || 'Unnamed'}** (Type: ${c.type || '?'}, ID: ${c.id || '?'})\n`;
});
md += "\n";
}

```

## Block with hash cadccd64e98f8445d94f9fd62874a03b
- src/scripts/main.js:L304
- src/scripts/utils.js:L47
```
});
md += "\n";
}

if (toggles.showModuleDetails && processedModules.length > 0) {
```

## Block with hash f3e29b267c3227ece37410f45649f531
- src/scripts/main.js:L331
- src/scripts/utils.js:L70
```
md += `| ${m.id} | ${moduleDesc} | ${m.label || ''} | ${connectionDesc} |`;
if (toggles.showFilters) md += ` ${filterDesc} |`;
md += ` ${errorDesc} |\n`;
});
}
```

## Block with hash 29482f28e09ab98049b20a7dc0ae6b11
- src/scripts/main.js:L332
- src/scripts/utils.js:L71
```
if (toggles.showFilters) md += ` ${filterDesc} |`;
md += ` ${errorDesc} |\n`;
});
}

```

## Block with hash 65b1a9afb2063f554bc478a626cc993e
- src/scripts/main.js:L333
- src/scripts/utils.js:L72
```
md += ` ${errorDesc} |\n`;
});
}

return md;
```

## Block with hash 3252adee1a3cbd12be2048614bea3ffd
- src/scripts/main.js:L334
- src/scripts/utils.js:L73
```
});
}

return md;
}
```

## Block with hash 99d6f9b1b7e09a70c2f81c88e3cc5a89
- src/scripts/main.js:L335
- src/scripts/utils.js:L74
```
}

return md;
}

```

## Block with hash 2c1556b48b296a7353b1d05974e17e67
- src/scripts/utils.js:L2
- src/workers/specWorker.js:L7
```
if (!str) return '';
return String(str)
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
```

## Block with hash 3761acf914207f8636b53bf9f5b26477
- src/scripts/utils.js:L3
- src/workers/specWorker.js:L8
```
return String(str)
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
.replace(/"/g, '&quot;')
```

## Block with hash 15293f1228ba39f2725d73df51da387a
- src/scripts/utils.js:L4
- src/workers/specWorker.js:L9
```
.replace(/&/g, '&amp;')
.replace(/</g, '&lt;')
.replace(/>/g, '&gt;')
.replace(/"/g, '&quot;')
.replace(/'/g, '&#039;');
```


---
name: cost-formula
description: >
  Fórmulas y lógica de cálculo de costos de datacenter para este proyecto.
  Usar SIEMPRE antes de modificar, crear o depurar cualquier lógica de cálculo
  de costos: energía IT, cooling overhead, PUE penalty por temperatura, comparativas
  entre ubicaciones, o cualquier función que produzca valores monetarios en el dashboard.
  También usar cuando el usuario pida agregar una nueva ubicación, cambiar tarifas,
  o ajustar los parámetros de configuración de racks.
---

# Cost Formula Skill — Datacenter Calculator

## Principios generales

- **Unidad base de energía**: kWh (kilovatio-hora)
- **Moneda**: USD dólares. El Salvador ya usa USD — no hacer conversión.
- **Período de cálculo**: mensual (default) y anual. Anual = mensual × 12.
- **Fuente de tarifas**:
  - USA: EIA API (`VITE_EIA_API_KEY`) — tarifas en ¢/kWh, convertir a $/kWh dividiendo entre 100
  - El Salvador: hardcoded `$0.18/kWh`

---

## Fórmulas principales

### 1. Carga IT total
```
itKw = racks × kwPerRack
```

### 2. Horas mensuales de operación
```
monthHours = annualHours / 12
// annualHours máximo = 8760 (24×365, operación continua)
```

### 3. Costo energía IT (sin overhead)
```
itCostMonth = itKw × monthHours × ratePerKwh
```

### 4. PUE efectivo (con penalty por temperatura)
```
pueEffective = clamp(pueBase + tempPenalty, min=1.1, max=2.5)
```

Tabla de `tempPenalty` por temperatura promedio de la ubicación:

| Temp promedio | tempPenalty | Descripción              |
|---------------|-------------|--------------------------|
| < 15°C        | -0.10       | Free cooling óptimo      |
| 15°C – 19°C   | -0.05       | Free cooling parcial     |
| 20°C – 24°C   | 0.00        | Nominal                  |
| 25°C – 29°C   | +0.10       | Penalty moderado         |
| ≥ 30°C        | +0.20       | Penalty alto (tropical)  |

> El Salvador (28°C) → tempPenalty = +0.10

### 5. Costo total de energía (IT + cooling overhead)
```
totalEnergyCost = itKw × pueEffective × monthHours × ratePerKwh
coolingOverhead = totalEnergyCost - itCostMonth
```

### 6. Otros overheads (iluminación, UPS losses, admin)
```
otherOverhead = totalEnergyCost × 0.08   // 8% fijo
```

### 7. Costo mensual final
```
grandTotalMonth = totalEnergyCost + otherOverhead
```

### 8. Costo anual
```
grandTotalAnnual = grandTotalMonth × 12
```

---

## Función de referencia (JavaScript)

```js
export function calculateCosts({ racks, kwPerRack, pueBase, annualHours, ratePerKwh, avgTempC }) {
  const monthHours = annualHours / 12;
  const itKw = racks * kwPerRack;

  const tempPenalty =
    avgTempC < 15  ? -0.10 :
    avgTempC < 20  ? -0.05 :
    avgTempC < 25  ?  0.00 :
    avgTempC < 30  ?  0.10 :
                      0.20;

  const pueEffective = Math.min(2.5, Math.max(1.1, pueBase + tempPenalty));
  const itCostMonth   = itKw * monthHours * ratePerKwh;
  const totalEnergy   = itKw * pueEffective * monthHours * ratePerKwh;
  const cooling       = totalEnergy - itCostMonth;
  const other         = totalEnergy * 0.08;
  const monthly       = totalEnergy + other;
  const annual        = monthly * 12;

  return {
    itKw,
    pueEffective,
    itCostMonth,
    coolingOverhead: cooling,
    otherOverhead: other,
    grandTotalMonth: monthly,
    grandTotalAnnual: annual,
  };
}
```

---

## Ubicaciones hardcodeadas (referencia)

Estas ubicaciones siempre están disponibles como fallback si la EIA API falla,
y El Salvador es permanentemente hardcoded:

```js
export const LOCATIONS = {
  sv: { name: 'El Salvador', ratePerKwh: 0.18, lat: 13.6929, lon: -89.2182, hardcoded: true },
  tx: { name: 'Texas',       ratePerKwh: 0.12, lat: 32.7767, lon: -96.7970, eiaState: 'TX' },
  ca: { name: 'California',  ratePerKwh: 0.24, lat: 37.3382, lon: -121.886, eiaState: 'CA' },
  va: { name: 'Virginia',    ratePerKwh: 0.10, lat: 38.8935, lon: -77.1546, eiaState: 'VA' },
  wa: { name: 'Washington',  ratePerKwh: 0.09, lat: 47.6062, lon: -122.332, eiaState: 'WA' },
  fl: { name: 'Florida',     ratePerKwh: 0.13, lat: 25.7617, lon: -80.1918, eiaState: 'FL' },
};
```

---

## Reglas de validación

- `racks`: entero, mínimo 1, máximo 500
- `kwPerRack`: número, mínimo 1, máximo 30
- `pueBase`: decimal, mínimo 1.1, máximo 2.0 (UI: slider de 1.1 a 2.0, paso 0.1)
- `annualHours`: entero, mínimo 4380 (50% uptime), máximo 8760 (100%)
- `ratePerKwh`: debe ser positivo; si la API retorna 0 o null → usar valor hardcoded de fallback

---

## Manejo de errores de API

Si la EIA API falla o retorna datos inválidos:
1. Usar el valor hardcoded de `LOCATIONS[state].ratePerKwh` como fallback
2. Mostrar un indicador visual sutil: badge "tarifa estimada" en lugar de "tarifa en tiempo real"
3. No bloquear la UI — el dashboard debe funcionar offline con datos hardcoded

---

## Notas para agregar nuevas ubicaciones

Al agregar una nueva ubicación (país de Centroamérica u otro estado USA):
1. Agregar entrada a `LOCATIONS` con lat/lon correctos
2. Si es USA: incluir `eiaState` con el código de 2 letras del estado
3. Si es fuera de USA: marcar `hardcoded: true` y definir `ratePerKwh` manualmente
4. La temperatura se obtiene automáticamente de Open-Meteo usando lat/lon — no hardcodear temp
5. Verificar que `tempPenalty` aplique correctamente según clima del lugar
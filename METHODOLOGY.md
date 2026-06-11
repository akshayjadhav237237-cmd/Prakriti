# Methodology & Emission Factors

This document outlines the methodology, carbon accounting rules, emission factors, and calculation formulas used in **Prakriti**, India's first proactive carbon budgeting platform.

---

## Data Sources
To construct representative footprints for urban Indian households and lifestyles, Prakriti utilizes authoritative local and global databases:

1. **Central Electricity Authority (CEA) India (v21.0)** — Used for grid electricity emission intensity calculations (national average grid emission factor).
2. **Automotive Research Association of India (ARAI)** — Used for road transit emission averages for petrol and electric two-wheelers.
3. **Central Pollution Control Board (CPCB) India** — Used for fuel combustion emission factors (petrol, diesel) and stationary diesel generators.
4. **WRI India (World Resources Institute)** — Transport emission data and regional transit database for CNG and local vehicle categories.
5. **Bureau of Energy Efficiency (BEE) India** — Appliance energy consumption data and star-rating efficiency averages for air conditioners.
6. **Ministry of Environment, Forest and Climate Change (MoEFCC) India** — National guidelines for low-carbon lifestyles (LiFE campaign).
7. **IPCC (Intergovernmental Panel on Climate Change) AR6 Working Group III** — Used for agricultural lifecycle and food category carbon bounds.

---

## Emission Factors Used

The table below lists the specific carbon emission factors implemented in `src/core/constants.ts` along with their units and primary sources:

| Category | Sub-category / Item | Factor | Unit | Source |
|---|---|---|---|---|
| **Energy** | Grid Electricity | **0.710** | kg CO₂e / kWh | CEA CO₂ Baseline Database v21.0 |
| **Transport** | Petrol Scooter (110cc) | **0.0334** | kg CO₂e / km | ARAI fuel economy averages |
| **Transport** | Electric Scooter | **0.0120** | kg CO₂e / km | CEA grid charging + ARAI vehicle efficiency |
| **Transport** | Ola / Uber Cab | **0.1490** | kg CO₂e / km | CPCB passenger vehicle averages |
| **Transport** | Mumbai Local Train | **0.0064** | kg CO₂e / passenger-km | India GHG Program / Indian Railways |
| **Transport** | Delhi Metro | **0.0139** | kg CO₂e / passenger-km | DMRC Annual Reports |
| **Transport** | CNG Auto | **0.1077** | kg CO₂e / km | WRI India transport database |
| **Transport** | Walk / Cycle | **0.0000** | kg CO₂e / km | Zero tailpipe / lifecycle emissions |
| **Fuels** | Petrol (combustion) | **2.3100** | kg CO₂e / Liter | CPCB fuel carbon content |
| **Fuels** | Diesel (combustion) | **2.6800** | kg CO₂e / Liter | CPCB fuel carbon content |
| **Fuels** | Diesel Generator (DG set)| **2.7000** | kg CO₂e / Liter | CPCB generator emission standards |
| **Cooling** | 1.5-ton AC (3-star) | **1.0650** | kg CO₂e / operational-hour | BEE averages (1.5 kWh/hr × 0.710) |
| **Cooling** | 1.5-ton AC (5-star) | **0.4660** | kg CO₂e / operational-hour | BEE averages (0.65 kWh/hr × 0.710) |
| **Food** | Dairy Products | **1.5000** | kg CO₂e / kg product | IPCC AR6 average agricultural lifecycle |
| **Food** | Mutton / Beef (Red Meat) | **12.0000** | kg CO₂e / kg product | IPCC AR6 agricultural baseline |
| **Food** | Chicken (Poultry) | **3.0000** | kg CO₂e / kg product | IPCC AR6 agricultural baseline |
| **Food** | Fresh Produce | **0.2000** | kg CO₂e / kg product | Local distribution lifecycle |
| **Food** | Processed Grains | **0.6000** | kg CO₂e / kg product | Milling, transport, processing |
| **Food** | Packaged Snacks | **1.2000** | kg CO₂e / kg product | Packaging + manufacturing overheads |
| **Meals** | Mutton Biryani (Red meat) | **5.0000** | kg CO₂e / serving | Recipe lifecycle estimate |
| **Meals** | Chicken Meal | **1.8000** | kg CO₂e / serving | Recipe lifecycle estimate |
| **Meals** | Veg Thali | **1.5000** | kg CO₂e / serving | WRI India food lifecycle data |
| **Meals** | Vegan Bowl | **0.5000** | kg CO₂e / serving | WRI India food lifecycle data |
| **Meals** | Swiggy / Zomato delivery | **0.1800** | kg CO₂e / order | Last-mile courier logistics average |
| **Meals** | Swiggy / Zomato packaging | **0.0500** | kg CO₂e / order | Single-use plastic/paper containers |

---

## Calculation Formulas

These formulas are implemented programmatically in `src/core/calculators.ts` to convert raw user inputs into carbon footprints:

### 1. Grid Electricity Footprint
$$\text{CO₂e (kg)} = \text{Consumption (kWh)} \times \text{Grid Factor (0.710 kg/kWh)}$$

### 2. Transport Footprint
$$\text{CO₂e (kg)} = \text{Distance (km)} \times \text{Transit Mode Factor (kg/km)}$$

### 3. Food Delivery Meal Footprint
$$\text{CO₂e (kg)} = \text{Meal Type Base CO₂e} + \text{Delivery Offset (0.18 kg)} + \text{Packaging Offset (0.05 kg if present)}$$

### 4. Air Conditioning (AC) Footprint
$$\text{CO₂e (kg)} = \text{Operation Duration (hours)} \times \text{AC Power Rating (kW)} \times \text{Grid Factor (0.710 kg/kWh)}$$
* *3-Star AC Power Rating:* $\approx 1.50$ kW
* *5-Star AC Power Rating:* $\approx 0.656$ kW

### 5. Diesel Generator (DG set) Footprint
$$\text{CO₂e (kg)} = \text{Operation Duration (hours)} \times \text{Fuel Consumption Rate (0.5 L/hour)} \times \text{DG Factor (2.70 kg/L)}$$

### 6. Seasonal Mode Adjustments
- **Diwali Mode (+15%):** Applies a $1.15\times$ modifier during October and November to account for firecrackers, extra sweets, ghee consumption, and home lighting.
- **IPL AC Mode (+30%):** Applies a $1.30\times$ modifier during March, April, and May to energy/cooling envelopes to simulate extra television screening and communal AC sharing.

---

## Limitations & Caveats
1. **Approximate Values:** Calculations are designed for cognitive anchoring and lifestyle awareness rather than compliance-grade auditing.
2. **National Grid Averaging:** Electricity emission factors use the national grid average. Regional factors vary (e.g., higher carbon intensity in coal-heavy Eastern regions; lower in Southern and Western regions with higher renewable penetration).
3. **Supply Chain Variation:** Food emissions assume average agricultural practices and local supply routes. Individual restaurant sourcing may vary.
4. **Scope 3 Purchases:** Personal carbon boundaries exclude capital purchases (e.g., electronics, furniture) unless manually logged or scanned via receipt OCR.

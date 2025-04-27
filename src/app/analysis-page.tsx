import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Upload, FileSpreadsheet, FileCheck, FileWarning, ArrowLeft } from "lucide-react";
import * as XLSX from 'xlsx';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { commodities, useAlphaVantageCommodity, getNewsRisk, getQuantityRisk, getFinalRisk } from "../App";
import { Link } from "react-router-dom";

// Types from App.tsx
interface NewsResult {
  articles: any[];
  highRiskArticles: number[];
  score: number;
}
interface RiskBreakdown {
  country: NewsResult;
  item: NewsResult;
  category: NewsResult;
  quantity: NewsResult;
  finalScore: number;
  finalLevel: string;
}
interface InventoryItem {
  id: number;
  itemName: string;
  industry: string;
  originCountry: string;
  quantity: number;
  unit: string;
  riskBreakdown: RiskBreakdown;
}

// Example lists for autocomplete
const ITEM_NAMES = [
  "Steel", "Aluminum", "Microchips", "Wheat", "Copper", "Plastic", "Textiles", "Lumber", "Oil", "Natural Gas", "Pharmaceuticals", "Automobiles", "Batteries", "Solar Panels", "Machinery", "Furniture", "Clothing", "Electronics", "Chemicals", "Rubber", "Paper", "Food Ingredients", "Medical Devices", "Aircraft Parts", "Semiconductors", "Fertilizer", "Cement", "Glass", "Paint", "Tires"
];
const INDUSTRIES = [
  "Automotive", "Electronics", "Agriculture", "Construction", "Manufacturing", "Aerospace", "Textiles", "Pharmaceuticals", "Energy", "Retail", "Food & Beverage", "Chemicals", "Mining", "Logistics", "Furniture", "Apparel", "Telecommunications", "Healthcare", "Metals", "Paper & Pulp", "Defense", "Consumer Goods", "Shipping", "Technology", "Utilities"
];
const COUNTRIES = [
  "United States", "China", "Germany", "India", "Japan", "South Korea", "Mexico", "Canada", "Brazil", "United Kingdom", "France", "Italy", "Russia", "Australia", "Turkey", "Vietnam", "Indonesia", "Netherlands", "Spain", "Poland", "Thailand", "Malaysia", "Singapore", "Switzerland", "Belgium", "Sweden", "Austria", "South Africa", "Saudi Arabia", "Argentina"
];

// Add simulated GPT helpers
function getGptAdvice({ itemName, industry, originCountry, quantity, unit, riskLevel }: { itemName: string, industry: string, originCountry: string, quantity: number, unit: string, riskLevel: string }) {
  if (!itemName || !industry || !originCountry) return '';
  const qtyStr = `${quantity} ${unit}`;
  if (riskLevel === 'HIGH') {
    return `Your ${itemName} imports in the ${industry} industry from ${originCountry} (${qtyStr}) are at high tariff risk. Consider diversifying suppliers, renegotiating contracts, or shifting sourcing to lower-risk countries. You could save up to 20% on costs by acting now.`;
  } else if (riskLevel === 'MEDIUM') {
    return `There is a moderate risk for your ${itemName} in ${industry} from ${originCountry} (${qtyStr}). Monitor news and consider partial hedging or flexible contracts. Potential savings: 5-10%.`;
  } else {
    return `Your ${itemName} in ${industry} from ${originCountry} (${qtyStr}) is at low risk. Maintain current strategy but stay alert for policy changes.`;
  }
}
function getGptAlternatives({ itemName, industry, originCountry, newsArticles, quantity, unit }: { itemName: string, industry: string, originCountry: string, newsArticles: any[], quantity: number, unit: string }) {
  const allCountries = [
    "Vietnam", "Mexico", "India", "Poland", "Turkey", "Malaysia", "Thailand", "Indonesia", "South Korea", "Canada", "Brazil", "Germany", "Netherlands"
  ];
  const alternatives = allCountries.filter(c => c !== originCountry).slice(0, 3);
  return `Consider shifting sourcing to ${alternatives.join(", ")}. Recent news and tariff trends suggest these countries have more favorable trade terms for ${itemName} (${quantity} ${unit}) in ${industry}. Transitioning within the next 3-6 months could reduce costs by 10-15% and lower risk exposure. Monitor policy updates for optimal timing.`;
}
function getGptSummary(type: string, name: string, articles: any[]) {
  if (!name || !articles || articles.length === 0) return `No recent news for this ${type}.`;
  // Simulate a summary based on number of high risk articles
  const highRisk = articles.filter((a: any) => a.highRisk).length;
  if (highRisk > 2) {
    return `Recent news for ${name} is mostly negative, with several high-risk developments. Consider reviewing your exposure.`;
  } else if (highRisk > 0) {
    return `Some recent news for ${name} indicates moderate risk. Stay vigilant and monitor developments.`;
  } else {
    return `News sentiment for ${name} is generally positive or neutral. No immediate action required.`;
  }
}

// 1. Add expanded commodities list and utility for auto-detection at the top:
const EXPANDED_COMMODITIES = [
  { label: 'Copper', symbol: 'COPPER', keywords: ['copper', 'wire', 'cu'], basePrice: 8800 },
  { label: 'Oil', symbol: 'OIL', keywords: ['oil', 'crude', 'petroleum'], basePrice: 75 },
  { label: 'Gold', symbol: 'GOLD', keywords: ['gold', 'au', 'bullion'], basePrice: 1950 },
  { label: 'Silver', symbol: 'SILVER', keywords: ['silver', 'ag'], basePrice: 24 },
  { label: 'Steel', symbol: 'STEEL', keywords: ['steel'], basePrice: 1245 },
  { label: 'Aluminum', symbol: 'ALUMINUM', keywords: ['aluminum', 'aluminium', 'al'], basePrice: 2100 },
  { label: 'Lumber', symbol: 'LUMBER', keywords: ['lumber', 'wood'], basePrice: 450 },
  { label: 'Wheat', symbol: 'WHEAT', keywords: ['wheat', 'grain'], basePrice: 650 },
  { label: 'Microchips', symbol: 'CHIPS', keywords: ['microchip', 'chip', 'semiconductor'], basePrice: 3.5 },
  { label: 'Rubber', symbol: 'RUBBER', keywords: ['rubber'], basePrice: 1.8 },
  { label: 'Plastic', symbol: 'PLASTIC', keywords: ['plastic', 'polymer'], basePrice: 1.2 },
  { label: 'Batteries', symbol: 'BATTERY', keywords: ['battery', 'batteries'], basePrice: 110 },
  { label: 'Textiles', symbol: 'TEXTILE', keywords: ['textile', 'fabric', 'cloth'], basePrice: 2.1 },
  { label: 'Machinery', symbol: 'MACHINERY', keywords: ['machinery', 'machine'], basePrice: 5000 },
  { label: 'Automobiles', symbol: 'AUTO', keywords: ['automobile', 'car', 'vehicle'], basePrice: 25000 },
];
function detectCommodity(itemName: string, industry: string) {
  const name = (itemName + ' ' + industry).toLowerCase();
  for (const c of EXPANDED_COMMODITIES) {
    if (c.keywords.some(k => name.includes(k))) return c;
  }
  return EXPANDED_COMMODITIES[0]; // fallback
}

// Add units list at the top
const UNITS = [
  'kg', 'ton', 'lb', 'unit', 'barrel', 'liter', 'gallon', 'm3', 'piece', 'box', 'container', 'sheet', 'roll', 'bag', 'dozen', 'pallet', 'carton', 'set', 'pair', 'pack'
];

export default function AnalysisPage() {
  const [tab, setTab] = useState<'manual' | 'csv'>('manual');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [formData, setFormData] = useState({ itemName: '', industry: '', originCountry: '', quantity: 0, unit: 'kg' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCommodity, setSelectedCommodity] = useState('COPPER');
  const [selectedCsvRowIdx, setSelectedCsvRowIdx] = useState(0);
  const { /* data: liveData, price, change, lastUpdated, error: liveError */ } = useAlphaVantageCommodity(selectedCommodity);

  // Add state for autocomplete
  const [itemSuggestions, setItemSuggestions] = useState<string[]>([]);
  const [industrySuggestions, setIndustrySuggestions] = useState<string[]>([]);
  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const itemInputRef = useRef<HTMLInputElement>(null);
  const industryInputRef = useRef<HTMLInputElement>(null);
  const countryInputRef = useRef<HTMLInputElement>(null);

  // 2. Add state for simulated price and tariff prediction
  const [simPriceData, setSimPriceData] = useState<{ time: string; price: number }[]>([]);
  const [simTariffData, setSimTariffData] = useState<{ time: string; tariff: number }[]>([]);
  const [simSummary, setSimSummary] = useState('');
  // 3. Simulate price and tariff prediction updates every 5s for detected commodity
  React.useEffect(() => {
    if (!inventory.length) return;
    const selectedItem = inventory[inventory.length - 1];
    const detected = detectCommodity(selectedItem.itemName, selectedItem.industry);
    let price = detected.basePrice;
    let tariff = 5 + Math.random() * 10; // base tariff %
    let priceArr = [];
    let tariffArr = [];
    const now = Date.now();
    for (let i = 19; i >= 0; i--) {
      const t = new Date(now - i * 5000);
      price += (Math.random() - 0.5) * price * 0.01;
      tariff += (Math.random() - 0.5) * 0.2;
      priceArr.push({ time: t.toLocaleTimeString(), price: Math.max(0, price) });
      tariffArr.push({ time: t.toLocaleTimeString(), tariff: Math.max(0, tariff) });
    }
    setSimPriceData(priceArr);
    setSimTariffData(tariffArr);
    setSimSummary(`The current price of ${detected.label} is $${priceArr[priceArr.length-1].price.toFixed(2)}. Tariff risk is trending ${tariffArr[tariffArr.length-1].tariff > 10 ? 'upward' : 'stable'}. Recent news suggests ${detected.label} may face ${tariffArr[tariffArr.length-1].tariff > 10 ? 'increased' : 'moderate'} tariffs in the coming weeks.`);
    const interval = setInterval(() => {
      setSimPriceData(prev => {
        const last = prev[prev.length-1] || { price: detected.basePrice };
        const newPrice = Math.max(0, last.price + (Math.random() - 0.5) * last.price * 0.01);
        const t = new Date().toLocaleTimeString();
        return [...prev.slice(1), { time: t, price: newPrice }];
      });
      setSimTariffData(prev => {
        const last = prev[prev.length-1] || { tariff: 10 };
        const newTariff = Math.max(0, last.tariff + (Math.random() - 0.5) * 0.2);
        const t = new Date().toLocaleTimeString();
        return [...prev.slice(1), { time: t, tariff: newTariff }];
      });
      setSimSummary(`The current price of ${detected.label} is $${simPriceData[simPriceData.length-1]?.price?.toFixed(2) || price.toFixed(2)}. Tariff risk is trending ${(simTariffData[simTariffData.length-1]?.tariff || tariff) > 10 ? 'upward' : 'stable'}. Recent news suggests ${detected.label} may face ${(simTariffData[simTariffData.length-1]?.tariff || tariff) > 10 ? 'increased' : 'moderate'} tariffs in the coming weeks.`);
    }, 5000);
    return () => clearInterval(interval);
  }, [inventory]);

  // After CSV upload, default to first row
  React.useEffect(() => {
    if (tab === 'csv' && inventory.length > 0) setSelectedCsvRowIdx(0);
  }, [tab, inventory.length]);

  // Manual Entry
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const [countryRes, itemRes, categoryRes] = await Promise.all([
        getNewsRisk(`US ${formData.originCountry} tariffs`, 'country'),
        getNewsRisk(`US ${formData.originCountry} ${formData.itemName} tariff OR US ${formData.itemName} tariff`, 'item'),
        getNewsRisk(`US ${formData.industry} tariffs`, 'category')
      ]);
      const quantityRes = getQuantityRisk(formData.quantity, formData.unit);
      const { finalScore, finalLevel } = getFinalRisk({
        country: countryRes.score,
        item: itemRes.score,
        category: categoryRes.score,
        quantity: quantityRes.score
      });
      const riskBreakdown: RiskBreakdown = {
        country: countryRes,
        item: itemRes,
        category: categoryRes,
        quantity: quantityRes,
        finalScore,
        finalLevel
      };
      const newItem: InventoryItem = {
        id: Date.now(),
        ...formData,
        riskBreakdown
      };
      setInventory([...inventory, newItem]);
      setFormData({ itemName: '', industry: '', originCountry: '', quantity: 0, unit: 'kg' });
    } catch (err) {
      setError('Error fetching news data.');
    }
    setLoading(false);
  };
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' ? parseInt(value) || 0 : value }));
  };

  // Autocomplete handlers
  const handleItemInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleManualChange(e);
    const val = e.target.value;
    if (val.length > 0) {
      setItemSuggestions(ITEM_NAMES.filter(i => i.toLowerCase().includes(val.toLowerCase())));
      setShowItemDropdown(true);
    } else {
      setShowItemDropdown(false);
    }
  };
  const handleIndustryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleManualChange(e);
    const val = e.target.value;
    if (val.length > 0) {
      setIndustrySuggestions(INDUSTRIES.filter(i => i.toLowerCase().includes(val.toLowerCase())));
      setShowIndustryDropdown(true);
    } else {
      setShowIndustryDropdown(false);
    }
  };
  const handleCountryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleManualChange(e);
    const val = e.target.value;
    if (val.length > 0) {
      setCountrySuggestions(COUNTRIES.filter(i => i.toLowerCase().includes(val.toLowerCase())));
      setShowCountryDropdown(true);
    } else {
      setShowCountryDropdown(false);
    }
  };
  const selectItemSuggestion = (val: string) => {
    setFormData(prev => ({ ...prev, itemName: val }));
    setShowItemDropdown(false);
    itemInputRef.current?.blur();
  };
  const selectIndustrySuggestion = (val: string) => {
    setFormData(prev => ({ ...prev, industry: val }));
    setShowIndustryDropdown(false);
    industryInputRef.current?.blur();
  };
  const selectCountrySuggestion = (val: string) => {
    setFormData(prev => ({ ...prev, originCountry: val }));
    setShowCountryDropdown(false);
    countryInputRef.current?.blur();
  };

  // CSV Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      if (rows.length < 2) throw new Error('File must have a header and at least one data row.');
      const header = rows[0].map((h: string) => h.trim().toLowerCase());
      const idxItem = header.indexOf('item name');
      const idxCat = header.indexOf('industry');
      const idxCountry = header.indexOf('origin country');
      const idxQty = header.indexOf('quantity');
      if ([idxItem, idxCat, idxCountry, idxQty].some(idx => idx === -1)) {
        throw new Error('Header must include: Item Name, Industry, Origin Country, Quantity');
      }
      setLoading(true);
      const newItems: InventoryItem[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[idxItem] || !row[idxCat] || !row[idxCountry] || isNaN(Number(row[idxQty]))) continue;
        const itemName = String(row[idxItem]);
        const industry = String(row[idxCat]);
        const originCountry = String(row[idxCountry]);
        const quantity = Number(row[idxQty]);
        try {
          const [countryRes, itemRes, categoryRes] = await Promise.all([
            getNewsRisk(`US ${originCountry} tariffs`, 'country'),
            getNewsRisk(`US ${originCountry} ${itemName} tariff OR US ${itemName} tariff`, 'item'),
            getNewsRisk(`US ${industry} tariffs`, 'category')
          ]);
          const quantityRes = getQuantityRisk(quantity, formData.unit);
          const { finalScore, finalLevel } = getFinalRisk({
            country: countryRes.score,
            item: itemRes.score,
            category: categoryRes.score,
            quantity: quantityRes.score
          });
          const riskBreakdown: RiskBreakdown = {
            country: countryRes,
            item: itemRes,
            category: categoryRes,
            quantity: quantityRes,
            finalScore,
            finalLevel
          };
          newItems.push({
            id: Date.now() + i,
            itemName,
            industry,
            originCountry,
            quantity,
            unit: formData.unit,
            riskBreakdown
          });
        } catch (err) {
          continue;
        }
      }
      setInventory(prev => [...prev, ...newItems]);
      setLoading(false);
    } catch (err: any) {
      setError('Failed to process file: ' + (err.message || 'Unknown error'));
      setLoading(false);
    }
  };

  // Results panel: show last added item or first if only one
  const selectedItem = inventory.length > 0 ? inventory[inventory.length - 1] : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">Help</Button>
            <Button size="sm">Dashboard</Button>
          </div>
        </div>
      </header>
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Upload or Enter Your Inventory Data</h1>
              <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed">Upload your inventory spreadsheet or manually enter items for tariff risk analysis and recommendations.</p>
            </div>
          </div>
          <div className="mx-auto max-w-4xl">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="manual" onClick={() => setTab('manual')}>Manual Entry</TabsTrigger>
                <TabsTrigger value="csv" onClick={() => setTab('csv')}>CSV Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="manual">
                <Card className="mb-8 border-2 border-dashed border-gray-200 bg-gray-50">
                  <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                    <div className="mb-4 p-4 rounded-full bg-blue-100">
                      <FileSpreadsheet className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Manual Entry</h3>
                    <form className="space-y-4 w-full max-w-md mx-auto" onSubmit={handleManualSubmit}>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Item Name</label>
                        <input
                          ref={itemInputRef}
                          type="text"
                          name="itemName"
                          value={formData.itemName}
                          onChange={handleItemInput}
                          onFocus={handleItemInput}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-center"
                          autoComplete="off"
                          required
                        />
                        {showItemDropdown && itemSuggestions.length > 0 && (
                          <ul className="absolute left-0 right-0 bg-white border z-10 max-h-40 overflow-y-auto rounded shadow text-center">
                            {itemSuggestions.map(s => (
                              <li key={s} className="px-3 py-2 hover:bg-blue-100 cursor-pointer" onMouseDown={() => selectItemSuggestion(s)}>{s}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Industry</label>
                        <input
                          ref={industryInputRef}
                          type="text"
                          name="industry"
                          value={formData.industry}
                          onChange={handleIndustryInput}
                          onFocus={handleIndustryInput}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-center"
                          autoComplete="off"
                          required
                        />
                        {showIndustryDropdown && industrySuggestions.length > 0 && (
                          <ul className="absolute left-0 right-0 bg-white border z-10 max-h-40 overflow-y-auto rounded shadow text-center">
                            {industrySuggestions.map(s => (
                              <li key={s} className="px-3 py-2 hover:bg-blue-100 cursor-pointer" onMouseDown={() => selectIndustrySuggestion(s)}>{s}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Origin Country</label>
                        <input
                          ref={countryInputRef}
                          type="text"
                          name="originCountry"
                          value={formData.originCountry}
                          onChange={handleCountryInput}
                          onFocus={handleCountryInput}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-center"
                          autoComplete="off"
                          required
                        />
                        {showCountryDropdown && countrySuggestions.length > 0 && (
                          <ul className="absolute left-0 right-0 bg-white border z-10 max-h-40 overflow-y-auto rounded shadow text-center">
                            {countrySuggestions.map(s => (
                              <li key={s} className="px-3 py-2 hover:bg-blue-100 cursor-pointer" onMouseDown={() => selectCountrySuggestion(s)}>{s}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleManualChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-center"
                          required
                          style={{ textAlign: 'center' }}
                        />
                        <select
                          name="unit"
                          value={formData.unit}
                          onChange={handleManualChange}
                          className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm bg-white"
                          style={{ minWidth: 70 }}
                        >
                          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                      {loading && (<div className="text-blue-600 text-sm">Checking news for tariff risk...</div>)}
                      {error && (<div className="text-red-600 text-sm">{error}</div>)}
                      <Button className="w-full" type="submit">Add Item</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="csv">
                <Card className="mb-8 border-2 border-dashed border-gray-200 bg-gray-50">
                  <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                    <div className="mb-4 p-4 rounded-full bg-blue-100">
                      <FileSpreadsheet className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">CSV Upload</h3>
                    <label htmlFor="csv-upload" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg cursor-pointer text-lg mb-2 transition-colors duration-150">
                      Choose File
                    </label>
                    <input id="csv-upload" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
                    <div className="text-xs text-gray-400 mt-1">Header must include: Item Name, Industry, Origin Country, Quantity</div>
                    {loading && (<div className="text-blue-600 text-sm">Processing file...</div>)}
                    {error && (<div className="text-red-600 text-sm">{error}</div>)}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            {/* Results Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                {inventory.length > 0 ? (
                  <div>
                    {/* CSV Row Selector (only in CSV mode) */}
                    {tab === 'csv' && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {inventory.map((item, idx) => (
                          <button
                            key={item.id}
                            className={`px-3 py-1 rounded border text-xs font-medium transition-colors duration-150 ${selectedCsvRowIdx === idx ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50'}`}
                            onClick={() => setSelectedCsvRowIdx(idx)}
                          >
                            Row {idx + 1}: {item.itemName}, {item.originCountry}, {item.quantity} {item.unit}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="mb-4 border-b border-gray-200 flex">
                      {['Risk Assessment', 'News & Analysis', 'Live Data & Numbers', 'Portfolio Overview'].map((tab, idx) => (
                        <button
                          key={tab}
                          className={`px-4 py-2 -mb-px border-b-2 font-medium focus:outline-none transition-colors duration-200 ${selectedTab === idx ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-indigo-600'}`}
                          onClick={() => setSelectedTab(idx)}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                    {(() => {
                      // Use selected row for CSV, last for manual
                      const selectedItem = tab === 'csv' ? inventory[selectedCsvRowIdx] : inventory[inventory.length - 1];
                      if (!selectedItem) return null;
                      if (selectedTab === 0) {
                        return (
                          <div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-sm font-medium text-gray-500">Item Name</p>
                                <p className="text-sm text-gray-900">{selectedItem.itemName}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Industry</p>
                                <p className="text-sm text-gray-900">{selectedItem.industry}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Origin Country</p>
                                <p className="text-sm text-gray-900">{selectedItem.originCountry}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">Quantity</p>
                                <p className="text-sm text-gray-900">{selectedItem.quantity} {selectedItem.unit}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium text-gray-500">Risk Assessment</p>
                                <p className={`text-lg font-bold ${selectedItem.riskBreakdown.finalLevel === 'HIGH' ? 'text-red-600' : selectedItem.riskBreakdown.finalLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>{selectedItem.riskBreakdown.finalLevel} ({selectedItem.riskBreakdown.finalScore}/100)</p>
                                <div className="mt-2 text-xs text-gray-700">
                                  <div>Country Risk: <span className={selectedItem.riskBreakdown.country.score >= 70 ? 'text-red-600' : selectedItem.riskBreakdown.country.score >= 30 ? 'text-yellow-600' : 'text-green-600'}>{selectedItem.riskBreakdown.country.score}/100</span></div>
                                  <div>Item Risk: <span className={selectedItem.riskBreakdown.item.score >= 70 ? 'text-red-600' : selectedItem.riskBreakdown.item.score >= 30 ? 'text-yellow-600' : 'text-green-600'}>{selectedItem.riskBreakdown.item.score}/100</span></div>
                                  <div>Industry Risk: <span className={selectedItem.riskBreakdown.category.score >= 70 ? 'text-red-600' : selectedItem.riskBreakdown.category.score >= 30 ? 'text-yellow-600' : 'text-green-600'}>{selectedItem.riskBreakdown.category.score}/100</span></div>
                                  <div>Quantity Risk: <span className={selectedItem.riskBreakdown.quantity.score >= 70 ? 'text-red-600' : selectedItem.riskBreakdown.quantity.score >= 30 ? 'text-yellow-600' : 'text-green-600'}>{selectedItem.riskBreakdown.quantity.score}/100</span></div>
                                </div>
                              </div>
                            </div>
                            {selectedItem && (
                              <div className="mt-4 p-4 bg-blue-50 rounded text-blue-900 text-center">
                                <strong>Actionable Advice:</strong> {getGptAdvice({
                                  itemName: selectedItem.itemName,
                                  industry: selectedItem.industry,
                                  originCountry: selectedItem.originCountry,
                                  quantity: selectedItem.quantity,
                                  unit: selectedItem.unit,
                                  riskLevel: selectedItem.riskBreakdown.finalLevel
                                })}
                                <div className="mt-2 text-blue-800">
                                  <strong>Alternatives:</strong> {getGptAlternatives({
                                    itemName: selectedItem.itemName,
                                    industry: selectedItem.industry,
                                    originCountry: selectedItem.originCountry,
                                    newsArticles: [
                                      ...selectedItem.riskBreakdown.country.articles,
                                      ...selectedItem.riskBreakdown.item.articles,
                                      ...selectedItem.riskBreakdown.category.articles
                                    ],
                                    quantity: selectedItem.quantity,
                                    unit: selectedItem.unit
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      } else if (selectedTab === 1) {
                        return (
                          <div>
                            <div className="mt-4">
                              <p className="text-sm font-semibold text-gray-700 mb-2">News Used for Risk Assessment:</p>
                              <div className="mb-2">
                                <span className="font-semibold">Country News:</span>
                                <div className="text-xs italic text-gray-600 mb-1">{getGptSummary('country', selectedItem.originCountry, selectedItem.riskBreakdown.country.articles)}</div>
                                {selectedItem.riskBreakdown.country.articles.length === 0 ? (
                                  <span className="text-xs text-gray-500 ml-2">No news found.</span>
                                ) : (
                                  <ul className="space-y-1">
                                    {selectedItem.riskBreakdown.country.articles.map((article, idx) => (
                                      <li key={article.url} className={`border-l-4 pl-2 ${selectedItem.riskBreakdown.country.highRiskArticles.includes(idx) ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-medium underline">{article.title}</a>
                                        <span className="ml-2 text-xs text-gray-500">({article.source?.name}, {new Date(article.publishedAt).toLocaleDateString()})</span>
                                        {selectedItem.riskBreakdown.country.highRiskArticles.includes(idx) && (
                                          <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-800 text-xs rounded">Contributed to risk</span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              <div className="mb-2">
                                <span className="font-semibold">Item News:</span>
                                <div className="text-xs italic text-gray-600 mb-1">{getGptSummary('item', selectedItem.itemName, selectedItem.riskBreakdown.item.articles)}</div>
                                {selectedItem.riskBreakdown.item.articles.length === 0 ? (
                                  <span className="text-xs text-gray-500 ml-2">No news found.</span>
                                ) : (
                                  <ul className="space-y-1">
                                    {selectedItem.riskBreakdown.item.articles.map((article, idx) => (
                                      <li key={article.url} className={`border-l-4 pl-2 ${selectedItem.riskBreakdown.item.highRiskArticles.includes(idx) ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-medium underline">{article.title}</a>
                                        <span className="ml-2 text-xs text-gray-500">({article.source?.name}, {new Date(article.publishedAt).toLocaleDateString()})</span>
                                        {selectedItem.riskBreakdown.item.highRiskArticles.includes(idx) && (
                                          <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-800 text-xs rounded">Contributed to risk</span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              <div className="mb-2">
                                <span className="font-semibold">Industry News:</span>
                                <div className="text-xs italic text-gray-600 mb-1">{getGptSummary('industry', selectedItem.industry, selectedItem.riskBreakdown.category.articles)}</div>
                                {selectedItem.riskBreakdown.category.articles.length === 0 ? (
                                  <span className="text-xs text-gray-500 ml-2">No news found.</span>
                                ) : (
                                  <ul className="space-y-1">
                                    {selectedItem.riskBreakdown.category.articles.map((article, idx) => (
                                      <li key={article.url} className={`border-l-4 pl-2 ${selectedItem.riskBreakdown.category.highRiskArticles.includes(idx) ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-medium underline">{article.title}</a>
                                        <span className="ml-2 text-xs text-gray-500">({article.source?.name}, {new Date(article.publishedAt).toLocaleDateString()})</span>
                                        {selectedItem.riskBreakdown.category.highRiskArticles.includes(idx) && (
                                          <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-800 text-xs rounded">Contributed to risk</span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                              <div className="mb-2">
                                <span className="font-semibold">Quantity Risk:</span>
                                <span className="ml-2 text-xs text-gray-500">{selectedItem.riskBreakdown.quantity.score > 0 ? `High quantity may increase risk.` : 'No bulk restrictions found.'}</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">Powered by <a href="https://newsapi.org/" className="underline" target="_blank" rel="noopener noreferrer">NewsAPI.org</a></p>
                            </div>
                          </div>
                        );
                      } else if (selectedTab === 2) {
                        if (!inventory.length) return <div className="text-gray-500">No data to show. Add an item first.</div>;
                        const selectedItem = inventory[inventory.length - 1];
                        const detected = detectCommodity(selectedItem.itemName, selectedItem.industry);
                        const currentPrice = simPriceData.length ? simPriceData[simPriceData.length-1].price : detected.basePrice;
                        const currentTariff = simTariffData.length ? simTariffData[simTariffData.length-1].tariff : 5;
                        const priceChange = simPriceData.length > 1 ? 
                          ((currentPrice - simPriceData[0].price) / simPriceData[0].price * 100).toFixed(2) : 0;
                        const tariffChange = simTariffData.length > 1 ? 
                          (currentTariff - simTariffData[0].tariff).toFixed(2) : 0;
                        
                        // Calculate additional metrics
                        const priceVolatility = simPriceData.length > 1 ? 
                          Math.sqrt(simPriceData.reduce((acc, curr, idx, arr) => {
                            if (idx === 0) return 0;
                            return acc + Math.pow(curr.price - arr[idx-1].price, 2);
                          }, 0) / (simPriceData.length - 1)).toFixed(2) : 0;
                        
                        const maxPrice = Math.max(...simPriceData.map(d => d.price));
                        const minPrice = Math.min(...simPriceData.map(d => d.price));
                        
                        return (
                          <div className="space-y-6">
                            {/* Mini Dashboard */}
                            <div className="grid grid-cols-4 gap-4">
                              <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="text-sm text-gray-500 mb-1">Current Price</div>
                                <div className="text-xl font-bold text-green-700">${currentPrice.toFixed(2)}</div>
                                <div className={`text-xs ${Number(priceChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                  {Number(priceChange) >= 0 ? '↑' : '↓'} {Math.abs(Number(priceChange))}% (5m)
                                </div>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="text-sm text-gray-500 mb-1">Tariff Risk</div>
                                <div className="text-xl font-bold text-orange-700">{currentTariff.toFixed(1)}%</div>
                                <div className={`text-xs ${Number(tariffChange) >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                  {Number(tariffChange) >= 0 ? '↑' : '↓'} {Math.abs(Number(tariffChange))}% (5m)
                                </div>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="text-sm text-gray-500 mb-1">Price Range</div>
                                <div className="text-xl font-bold text-blue-700">${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}</div>
                                <div className="text-xs text-gray-500">Last 5 minutes</div>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="text-sm text-gray-500 mb-1">Volatility</div>
                                <div className="text-xl font-bold text-purple-700">${priceVolatility}</div>
                                <div className="text-xs text-gray-500">Standard deviation</div>
                              </div>
                            </div>

                            {/* Price Graph */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                              <div className="flex justify-between items-center mb-2">
                                <div className="text-sm font-medium text-gray-700">Price Trend (Last 5 Minutes)</div>
                                <button 
                                  onClick={() => {
                                    const csv = simPriceData.map(d => `${d.time},${d.price}`).join('\n');
                                    const blob = new Blob([csv], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${detected.label.toLowerCase()}-price-data.csv`;
                                    a.click();
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Export Data
                                </button>
                              </div>
                              <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={simPriceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                      dataKey="time" 
                                      tick={{ fontSize: 12 }}
                                      tickFormatter={(value) => value.split(':').slice(1).join(':')}
                                    />
                                    <YAxis 
                                      domain={['auto', 'auto']}
                                      tick={{ fontSize: 12 }}
                                      tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip 
                                      contentStyle={{ 
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                      }}
                                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                                      labelFormatter={(label) => `Time: ${label}`}
                                    />
                                    <Line 
                                      type="monotone" 
                                      dataKey="price" 
                                      stroke="#2563eb" 
                                      strokeWidth={2}
                                      dot={false} 
                                      isAnimationActive={false}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Tariff Graph */}
                            <div className="bg-white p-4 rounded-lg shadow-sm border">
                              <div className="flex justify-between items-center mb-2">
                                <div className="text-sm font-medium text-gray-700">Tariff Risk Trend</div>
                                <button 
                                  onClick={() => {
                                    const csv = simTariffData.map(d => `${d.time},${d.tariff}`).join('\n');
                                    const blob = new Blob([csv], { type: 'text/csv' });
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${detected.label.toLowerCase()}-tariff-data.csv`;
                                    a.click();
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                >
                                  Export Data
                                </button>
                              </div>
                              <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={simTariffData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                      dataKey="time" 
                                      tick={{ fontSize: 12 }}
                                      tickFormatter={(value) => value.split(':').slice(1).join(':')}
                                    />
                                    <YAxis 
                                      domain={['auto', 'auto']}
                                      tick={{ fontSize: 12 }}
                                      tickFormatter={(value) => `${value}%`}
                                    />
                                    <Tooltip 
                                      contentStyle={{ 
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '6px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                      }}
                                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Tariff Risk']}
                                      labelFormatter={(label) => `Time: ${label}`}
                                    />
                                    <Line 
                                      type="monotone" 
                                      dataKey="tariff" 
                                      stroke="#f59e0b" 
                                      strokeWidth={2}
                                      dot={false} 
                                      isAnimationActive={false}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Enhanced Analysis Section */}
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="text-sm font-medium text-blue-900 mb-2">Market Analysis & Recommendations</div>
                              <div className="text-sm text-blue-800 space-y-2">
                                <p>{simSummary}</p>
                                <div className="mt-3 pt-3 border-t border-blue-200">
                                  <div className="font-medium text-blue-900">Key Insights:</div>
                                  <ul className="list-disc list-inside space-y-1 mt-1">
                                    <li>Price volatility: {Math.abs(Number(priceChange)) > 2 ? 'High' : 'Low'} (${priceVolatility} std dev)</li>
                                    <li>Tariff risk trend: {Number(tariffChange) > 0.5 ? 'Increasing' : Number(tariffChange) < -0.5 ? 'Decreasing' : 'Stable'}</li>
                                    <li>Market sentiment: {Number(priceChange) > 0 ? 'Positive' : 'Negative'}</li>
                                    <li>Price range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} (${((maxPrice - minPrice) / minPrice * 100).toFixed(1)}% spread)</li>
                                  </ul>
                                </div>
                                <div className="mt-3 pt-3 border-t border-blue-200">
                                  <div className="font-medium text-blue-900">Recommendations:</div>
                                  <ul className="list-disc list-inside space-y-1 mt-1">
                                    <li>{Number(priceChange) > 2 ? 'Consider taking profits' : Number(priceChange) < -2 ? 'Consider buying opportunities' : 'Hold current position'}</li>
                                    <li>{Number(tariffChange) > 0.5 ? 'Monitor tariff developments closely' : 'Tariff risk is stable'}</li>
                                    <li>{Math.abs(Number(priceChange)) > 2 ? 'High volatility - consider hedging strategies' : 'Low volatility - standard trading approach'}</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      } else if (selectedTab === 3) {
                        // Portfolio Overview tab
                        // Compute averages
                        const avgRisk = (inventory.reduce((sum, item) => sum + (item.riskBreakdown.finalScore || 0), 0) / inventory.length).toFixed(1);
                        const avgPrice = (inventory.reduce((sum, item) => {
                          const detected = detectCommodity(item.itemName, item.industry);
                          return sum + detected.basePrice;
                        }, 0) / inventory.length).toFixed(2);
                        const avgTariff = (inventory.reduce((sum, item) => {
                          // Simulate average tariff as 10 for now (or use real if available)
                          return sum + 10;
                        }, 0) / inventory.length).toFixed(2);
                        // GPT-style summary
                        const gptPortfolioAdvice = `Based on your current inventory, your average tariff risk score is ${avgRisk}/100 and your average commodity price is $${avgPrice}. The average tariff rate is ${avgTariff}%. To optimize your portfolio, consider diversifying suppliers for high-risk items, negotiating contracts for stable commodities, and monitoring market trends for price volatility. Strategic rebalancing could reduce your overall risk and improve cost efficiency.`;
                        return (
                          <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="text-sm text-gray-500 mb-1">Avg. Tariff Risk Score</div>
                                <div className="text-xl font-bold text-indigo-700">{avgRisk}/100</div>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="text-sm text-gray-500 mb-1">Avg. Commodity Price</div>
                                <div className="text-xl font-bold text-green-700">${avgPrice}</div>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm border">
                                <div className="text-sm text-gray-500 mb-1">Avg. Tariff Rate</div>
                                <div className="text-xl font-bold text-orange-700">{avgTariff}%</div>
                              </div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-6 mt-6">
                              <div className="text-lg font-bold text-blue-900 mb-2">Portfolio Action Plan</div>
                              <div className="text-blue-800 text-base">{gptPortfolioAdvice}</div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="text-blue-600 text-6xl">📊</div>
                    <p className="text-gray-500">Your analysis results will appear here</p>
                    <div className="text-sm px-4 py-2 bg-blue-50 text-blue-800 rounded-full mx-auto w-fit">No data yet</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t bg-gray-50">
        <div className="container py-6 px-4 md:px-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} TariffDefense. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 
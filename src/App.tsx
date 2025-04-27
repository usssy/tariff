import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Routes, Route, Link } from 'react-router-dom'

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
  category: string;
  originCountry: string;
  quantity: number;
  riskBreakdown: RiskBreakdown;
}

const NEWS_API_KEY = '7b79cbcfc96e4a7e8075f0ad19b5089a';
const highRiskKeywords = [
  'tariff', 'trade war', 'sanction', 'ban', 'restriction', 'high duty', 'import tax', 'retaliation', 'penalty', 'levy', 'embargo', 'quota', 'anti-dumping', 'duty'
];

const getNewsRisk = async (query: string, context: string): Promise<NewsResult> => {
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${NEWS_API_KEY}&language=en&sortBy=publishedAt&pageSize=10`;
  const response = await fetch(url);
  const data = await response.json();
  let highRiskArticles: number[] = [];
  if (data.status === 'ok') {
    data.articles.forEach((article: any, idx: number) => {
      if (highRiskKeywords.some(keyword =>
        (article.title + ' ' + (article.description || '')).toLowerCase().includes(keyword)
      )) {
        highRiskArticles.push(idx);
      }
    });
  }
  // Score: 100 if any high risk, else 0, or scale by number of high risk articles
  const score = highRiskArticles.length > 0 ? Math.min(100, highRiskArticles.length * 25) : 0;
  return {
    articles: data.articles || [],
    highRiskArticles,
    score
  };
};

const getQuantityRisk = (quantity: number): NewsResult => {
  // Simple logic: if quantity > 1000, risk increases
  let score = 0;
  if (quantity > 10000) score = 100;
  else if (quantity > 1000) score = 50;
  else if (quantity > 100) score = 20;
  return { articles: [], highRiskArticles: [], score };
};

const getFinalRisk = (scores: {country: number, item: number, category: number, quantity: number}): {finalScore: number, finalLevel: string} => {
  // Weighted: Item 40%, Country 30%, Category 20%, Quantity 10%
  const finalScore = Math.round(scores.item * 0.4 + scores.country * 0.3 + scores.category * 0.2 + scores.quantity * 0.1);
  let finalLevel = 'LOW';
  if (finalScore >= 70) finalLevel = 'HIGH';
  else if (finalScore >= 30) finalLevel = 'MEDIUM';
  return { finalScore, finalLevel };
};

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between mb-8">
              <Link to="/" className="text-blue-600 hover:underline">Manual Entry</Link>
              <Link to="/csv" className="text-blue-600 hover:underline">CSV Upload</Link>
            </div>
            <Routes>
              <Route path="/" element={<ManualEntryView />} />
              <Route path="/csv" element={<CSVUploadView />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

// Manual entry view (original)
function ManualEntryView() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    originCountry: '',
    quantity: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Run all queries in parallel
      const [countryRes, itemRes, categoryRes] = await Promise.all([
        getNewsRisk(`US ${formData.originCountry} tariffs`, 'country'),
        getNewsRisk(`US ${formData.originCountry} ${formData.itemName} tariff OR US ${formData.itemName} tariff`, 'item'),
        getNewsRisk(`US ${formData.category} tariffs`, 'category')
      ]);
      const quantityRes = getQuantityRisk(formData.quantity);
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
      setFormData({
        itemName: '',
        category: '',
        originCountry: '',
        quantity: 0
      });
    } catch (err) {
      setError('Error fetching news data.');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">TariffGuard</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Origin Country</label>
                <input
                  type="text"
                  name="originCountry"
                  value={formData.originCountry}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              
              {loading && (
                <div className="text-blue-600 text-sm">Checking news for tariff risk...</div>
              )}
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Item
              </button>
            </form>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Current Inventory</h2>
              <div className="space-y-4">
                {inventory.map((item) => (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Item Name</p>
                        <p className="text-sm text-gray-900">{item.itemName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Category</p>
                        <p className="text-sm text-gray-900">{item.category}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Origin Country</p>
                        <p className="text-sm text-gray-900">{item.originCountry}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Quantity</p>
                        <p className="text-sm text-gray-900">{item.quantity}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-gray-500">Risk Assessment</p>
                        <p className={`text-lg font-bold ${item.riskBreakdown.finalLevel === 'HIGH' ? 'text-red-600' : item.riskBreakdown.finalLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>{item.riskBreakdown.finalLevel} ({item.riskBreakdown.finalScore}/100)</p>
                        <div className="mt-2 text-xs text-gray-700">
                          <div>Country Risk: <span className={item.riskBreakdown.country.score >= 70 ? 'text-red-600' : item.riskBreakdown.country.score >= 30 ? 'text-yellow-600' : 'text-green-600'}>{item.riskBreakdown.country.score}/100</span></div>
                          <div>Item Risk: <span className={item.riskBreakdown.item.score >= 70 ? 'text-red-600' : item.riskBreakdown.item.score >= 30 ? 'text-yellow-600' : 'text-green-600'}>{item.riskBreakdown.item.score}/100</span></div>
                          <div>Category Risk: <span className={item.riskBreakdown.category.score >= 70 ? 'text-red-600' : item.riskBreakdown.category.score >= 30 ? 'text-yellow-600' : 'text-green-600'}>{item.riskBreakdown.category.score}/100</span></div>
                          <div>Quantity Risk: <span className={item.riskBreakdown.quantity.score >= 70 ? 'text-red-600' : item.riskBreakdown.quantity.score >= 30 ? 'text-yellow-600' : 'text-green-600'}>{item.riskBreakdown.quantity.score}/100</span></div>
                        </div>
                      </div>
                    </div>
                    {/* News Transparency Section */}
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">News Used for Risk Assessment:</p>
                      <div className="mb-2">
                        <span className="font-semibold">Country News:</span>
                        {item.riskBreakdown.country.articles.length === 0 ? (
                          <span className="text-xs text-gray-500 ml-2">No news found.</span>
                        ) : (
                          <ul className="space-y-1">
                            {item.riskBreakdown.country.articles.map((article, idx) => (
                              <li key={article.url} className={`border-l-4 pl-2 ${item.riskBreakdown.country.highRiskArticles.includes(idx) ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-medium underline">{article.title}</a>
                                <span className="ml-2 text-xs text-gray-500">({article.source?.name}, {new Date(article.publishedAt).toLocaleDateString()})</span>
                                {item.riskBreakdown.country.highRiskArticles.includes(idx) && (
                                  <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-800 text-xs rounded">Contributed to risk</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">Item News:</span>
                        {item.riskBreakdown.item.articles.length === 0 ? (
                          <span className="text-xs text-gray-500 ml-2">No news found.</span>
                        ) : (
                          <ul className="space-y-1">
                            {item.riskBreakdown.item.articles.map((article, idx) => (
                              <li key={article.url} className={`border-l-4 pl-2 ${item.riskBreakdown.item.highRiskArticles.includes(idx) ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-medium underline">{article.title}</a>
                                <span className="ml-2 text-xs text-gray-500">({article.source?.name}, {new Date(article.publishedAt).toLocaleDateString()})</span>
                                {item.riskBreakdown.item.highRiskArticles.includes(idx) && (
                                  <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-800 text-xs rounded">Contributed to risk</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">Category News:</span>
                        {item.riskBreakdown.category.articles.length === 0 ? (
                          <span className="text-xs text-gray-500 ml-2">No news found.</span>
                        ) : (
                          <ul className="space-y-1">
                            {item.riskBreakdown.category.articles.map((article, idx) => (
                              <li key={article.url} className={`border-l-4 pl-2 ${item.riskBreakdown.category.highRiskArticles.includes(idx) ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-medium underline">{article.title}</a>
                                <span className="ml-2 text-xs text-gray-500">({article.source?.name}, {new Date(article.publishedAt).toLocaleDateString()})</span>
                                {item.riskBreakdown.category.highRiskArticles.includes(idx) && (
                                  <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-800 text-xs rounded">Contributed to risk</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">Quantity Risk:</span>
                        <span className="ml-2 text-xs text-gray-500">{item.riskBreakdown.quantity.score > 0 ? `High quantity may increase risk.` : 'No bulk restrictions found.'}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">Powered by <a href="https://newsapi.org/" className="underline" target="_blank" rel="noopener noreferrer">NewsAPI.org</a></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// CSV upload view
function CSVUploadView() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // Assume header: Item Name, Category, Origin Country, Quantity
      const header = rows[0].map((h: string) => h.trim().toLowerCase());
      const idxItem = header.indexOf('item name');
      const idxCat = header.indexOf('category');
      const idxCountry = header.indexOf('origin country');
      const idxQty = header.indexOf('quantity');
      if ([idxItem, idxCat, idxCountry, idxQty].some(idx => idx === -1)) {
        throw new Error('Header must include: Item Name, Category, Origin Country, Quantity');
      }
      setLoading(true);
      // Process each row, skip header
      const newItems: InventoryItem[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[idxItem] || !row[idxCat] || !row[idxCountry] || isNaN(Number(row[idxQty]))) continue;
        const itemName = String(row[idxItem]);
        const category = String(row[idxCat]);
        const originCountry = String(row[idxCountry]);
        const quantity = Number(row[idxQty]);
        try {
          // Run all queries in parallel for each row
          const [countryRes, itemRes, categoryRes] = await Promise.all([
            getNewsRisk(`US ${originCountry} tariffs`, 'country'),
            getNewsRisk(`US ${originCountry} ${itemName} tariff OR US ${itemName} tariff`, 'item'),
            getNewsRisk(`US ${category} tariffs`, 'category')
          ]);
          const quantityRes = getQuantityRisk(quantity);
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
            id: Date.now() + i, // unique-ish
            itemName,
            category,
            originCountry,
            quantity,
            riskBreakdown
          });
        } catch (err) {
          // Skip row on error, optionally collect errors
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

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">TariffGuard</h1>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Upload Excel/CSV</label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="mt-1 block w-full text-sm text-gray-500"
              />
              <div className="text-xs text-gray-400 mt-1">Header must include: Item Name, Category, Origin Country, Quantity</div>
            </div>
            {loading && (
              <div className="text-blue-600 text-sm">Processing file...</div>
            )}
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            {inventory.length > 0 && (
              <div className="overflow-x-auto mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Origin Country</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 whitespace-nowrap">{item.itemName}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{item.category}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{item.originCountry}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{item.quantity}</td>
                        <td className={`px-3 py-2 whitespace-nowrap font-bold ${item.riskBreakdown.finalLevel === 'HIGH' ? 'text-red-600' : item.riskBreakdown.finalLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>{item.riskBreakdown.finalLevel} ({item.riskBreakdown.finalScore}/100)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 
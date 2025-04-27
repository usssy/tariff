import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LandingPage from './app/page'
import AnalysisPage from './app/analysis-page'
import LoginPage from './app/login'
import SignupPage from './app/signup'
import { auth, analytics } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { logEvent } from 'firebase/analytics'

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

const ALPHA_VANTAGE_API_KEY = 'UNG5SWUPV56Q1DI5';

export const commodities = [
  { label: 'Copper', symbol: 'COPPER' },
  { label: 'Oil', symbol: 'OIL' },
  { label: 'Gold', symbol: 'GOLD' },
  { label: 'Silver', symbol: 'SILVER' },
];

export const useAlphaVantageCommodity = (symbol: string) => {
  const [data, setData] = useState<{ time: string; price: number }[]>([]);
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      let url = '';
      setError(null);
      if (symbol === 'COPPER') {
        url = `https://www.alphavantage.co/query?function=COMMODITY_EXCHANGE_RATE&from_commodity=CU&to_currency=USD&apikey=${ALPHA_VANTAGE_API_KEY}`;
      } else if (symbol === 'OIL') {
        url = `https://www.alphavantage.co/query?function=WTI&interval=5min&apikey=${ALPHA_VANTAGE_API_KEY}`;
      } else if (symbol === 'GOLD') {
        url = `https://www.alphavantage.co/query?function=COMMODITY_EXCHANGE_RATE&from_commodity=XAU&to_currency=USD&apikey=${ALPHA_VANTAGE_API_KEY}`;
      } else if (symbol === 'SILVER') {
        url = `https://www.alphavantage.co/query?function=COMMODITY_EXCHANGE_RATE&from_commodity=XAG&to_currency=USD&apikey=${ALPHA_VANTAGE_API_KEY}`;
      }
      try {
        const res = await fetch(url);
        const json = await res.json();
        let priceVal = null;
        let chartData: { time: string; price: number }[] = [];
        if (symbol === 'COPPER' || symbol === 'GOLD' || symbol === 'SILVER') {
          priceVal = parseFloat(json['Realtime Commodity Exchange Rate']?.['5. Exchange Rate'] || '0');
          if (!isNaN(priceVal) && priceVal > 0) {
            chartData = [{ time: new Date().toLocaleTimeString(), price: priceVal }];
          }
        } else if (symbol === 'OIL') {
          const series = json['Time Series (5min)'] || {};
          chartData = Object.entries(series).map(([time, val]: any) => ({
            time,
            price: parseFloat(val['1. open'])
          })).reverse();
          priceVal = chartData.length > 0 ? chartData[chartData.length - 1].price : null;
        }
        if (isMounted) {
          if (priceVal && chartData.length > 0) {
            setPrice(priceVal);
            setChange(null);
            setData(chartData);
            setLastUpdated(new Date());
            setError(null);
          } else {
            throw new Error('No valid data');
          }
        }
      } catch (e) {
        if (isMounted) {
          setError('Live data not available. Showing demo data.');
          setPrice(Math.random() * 1000 + 1000);
          setChange(Math.random() > 0.5 ? 1 : -1);
          setData([{ time: new Date().toLocaleTimeString(), price: Math.random() * 1000 + 1000 }]);
          setLastUpdated(new Date());
        }
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);
  return { data, price, change, lastUpdated, error };
};

const NEWS_API_KEY = '7b79cbcfc96e4a7e8075f0ad19b5089a';
const highRiskKeywords = [
  'tariff', 'trade war', 'sanction', 'ban', 'restriction', 'high duty', 'import tax', 'retaliation', 'penalty', 'levy', 'embargo', 'quota', 'anti-dumping', 'duty'
];

export const getNewsRisk = async (query: string, context: string): Promise<NewsResult> => {
  // Simulate risk: high for certain countries, otherwise mostly low/medium
  const highRiskCountries = ["China", "Russia", "Turkey", "Iran"];
  const isHighRisk = highRiskCountries.some(c => query.toLowerCase().includes(c.toLowerCase()));
  let score = 0;
  let highRiskArticles: number[] = [];
  let articles: any[] = [];
  if (isHighRisk) {
    score = 75 + Math.floor(Math.random() * 25); // 75-100
    highRiskArticles = [0, 1, 2];
    articles = [
      { title: "Tariff hike announced", url: "#", source: { name: "Reuters" }, publishedAt: new Date().toISOString(), highRisk: true },
      { title: "Trade war escalates", url: "#", source: { name: "Bloomberg" }, publishedAt: new Date().toISOString(), highRisk: true },
      { title: "Sanctions imposed", url: "#", source: { name: "WSJ" }, publishedAt: new Date().toISOString(), highRisk: true }
    ];
  } else {
    // 60% low, 30% medium, 10% high
    const rand = Math.random();
    if (rand < 0.6) {
      score = Math.floor(Math.random() * 20); // 0-19
      highRiskArticles = [];
      articles = [
        { title: "Stable trade relations", url: "#", source: { name: "Reuters" }, publishedAt: new Date().toISOString(), highRisk: false },
        { title: "Tariff reductions discussed", url: "#", source: { name: "Bloomberg" }, publishedAt: new Date().toISOString(), highRisk: false }
      ];
    } else if (rand < 0.9) {
      score = 30 + Math.floor(Math.random() * 30); // 30-59
      highRiskArticles = [1];
      articles = [
        { title: "Minor tariff adjustment", url: "#", source: { name: "WSJ" }, publishedAt: new Date().toISOString(), highRisk: false },
        { title: "Potential for new duties", url: "#", source: { name: "FT" }, publishedAt: new Date().toISOString(), highRisk: true }
      ];
    } else {
      score = 70 + Math.floor(Math.random() * 30); // 70-99
      highRiskArticles = [0, 1];
      articles = [
        { title: "Unexpected tariff increase", url: "#", source: { name: "Reuters" }, publishedAt: new Date().toISOString(), highRisk: true },
        { title: "Trade dispute emerges", url: "#", source: { name: "Bloomberg" }, publishedAt: new Date().toISOString(), highRisk: true }
      ];
    }
  }
  return {
    articles,
    highRiskArticles,
    score
  };
};

export const getQuantityRisk = (quantity: number, unit: string): NewsResult => {
  let score = 0;
  let q = quantity;
  if (unit === 'ton') q *= 1000;
  if (unit === 'lb') q *= 0.4536;
  if (unit === 'barrel') q *= 159;
  if (unit === 'gallon') q *= 3.785;
  if (unit === 'm3') q *= 1000;
  // ... add more conversions as needed
  if (q > 10000) score = 100;
  else if (q > 1000) score = 50;
  else if (q > 100) score = 20;
  return { articles: [], highRiskArticles: [], score };
};

export const getFinalRisk = (scores: {country: number, item: number, category: number, quantity: number}): {finalScore: number, finalLevel: string} => {
  // Weighted: Item 40%, Country 30%, Category 20%, Quantity 10%
  const finalScore = Math.round(scores.item * 0.4 + scores.country * 0.3 + scores.category * 0.2 + scores.quantity * 0.1);
  let finalLevel = 'LOW';
  if (finalScore >= 70) finalLevel = 'HIGH';
  else if (finalScore >= 30) finalLevel = 'MEDIUM';
  return { finalScore, finalLevel };
};

// Analytics wrapper component
function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    // Log page view when location changes
    logEvent(analytics, 'page_view', {
      page_path: location.pathname,
      page_title: document.title
    });
  }, [location]);

  return <>{children}</>;
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Log user sign in/out events
      if (user) {
        logEvent(analytics, 'login', {
          method: 'email'
        });
      } else {
        logEvent(analytics, 'logout');
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <AnalyticsWrapper>
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/analysis" />} />
        <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/analysis" />} />
        <Route path="/analysis" element={user ? <AnalysisPage /> : <Navigate to="/login" />} />
      </Routes>
    </AnalyticsWrapper>
  );
}

export default App; 
import { useState } from 'react'

interface InventoryItem {
  id: number;
  itemName: string;
  category: string;
  originCountry: string;
  quantity: number;
  riskLevel: string;
}

function App() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    originCountry: '',
    quantity: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItem = {
      id: Date.now(),
      ...formData,
      riskLevel: 'LOW'
    };
    setInventory([...inventory, newItem]);
    setFormData({
      itemName: '',
      category: '',
      originCountry: '',
      quantity: 0
    });
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
                      <div>
                        <p className="text-sm font-medium text-gray-500">Risk Level</p>
                        <p className="text-sm text-gray-900">{item.riskLevel}</p>
                      </div>
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

export default App 
"use client";

import {
  Package,
  BadgeDollarSign,
  MapPin,
  Navigation,
  TrendingUp,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import AdminHeader from "@/components/AdminHeader";
import LargeStatsCard from "@/components/LargeStatsCard";
import RecentActivity from "@/components/RecentActivity";
import StatsCard from "@/components/StatsCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useEffect, useState } from "react";

const activities = [

  {

    id: 1,

    text: "Успішно імпортовано CSV (450 замовлень)",

    time: "2 хв тому",

    type: "system" as const,

  },

  {

    id: 2,

    text: "Виявлено нову податкову зону (Erie County)",

    time: "15 хв тому",

    type: "tax" as const,

  },

  {

    id: 3,

    text: "Дрон #D-402 завершив доставку (Lat: 40.71, Lon: -74.00)",

    time: "32 хв тому",

    type: "order" as const,

  },

  {

    id: 4,

    text: "Помилка валідації координат у замовленні #ORD-892",

    time: "1 год тому",

    type: "alert" as const,

  },

];



export default function AdminPage() {
const [chartData,setChartData]=useState([])
const [isLoading,setIsLoading]=useState(true)
const [statsData,setStatsData]=useState({

  totalOrders: 0,
  totalTaxes: 0,
  taxZones: 0,
  avgOrderValue: 0,
  avgTaxRate: 0,
})


useEffect(()=>{
  const fetchChartData=async()=>{
    try {
      const [chartRes,statsRes]=await Promise.all([
         fetch('http://localhost:8080/api/orders/taxes'),
         fetch('http://localhost:8080/api/orders/stats')
      ])
        
      if(chartRes.ok){
        const data=await chartRes.json()
        setChartData(data)
      }
      if(statsRes.ok){
        const statsDataResult=await statsRes.json()
        setStatsData(statsDataResult)
      }
    } catch (error) {
      console.error('Помилка завантаження графіка',error)
    }finally{
      setIsLoading(false)
    }
  }
  fetchChartData()
},[])
  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] w-full">
      <AdminHeader
        title="Операційний центр"
        subtitle="Моніторинг доставок та податків (NY State)"
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <StatsCard
            title="Всього замовлень"
            value={(statsData?.totalOrders || 0).toLocaleString('en-US')}
            trend="+124 після імпорту"
            trendColor="green"
          />
          <StatsCard
            title="Зібрано податків"
            value={`$${statsData.totalTaxes.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`}
            trend="Composite Tax"
            trendColor="gray"
          />
          <StatsCard
            title="Податкових зон"
            value={statsData.taxZones.toString()}
            trend="NY State"
            trendColor="gray"
          />
          <StatsCard
           title="Середнє замовлення"
           value={`$${statsData.avgOrderValue.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`}
           trend="За весь час"
           trendColor="green"
         /> 
            </div>
          <LargeStatsCard
            icon={TrendingUp}
            title="Ефективна податкова ставка (Середня)"
            value={`${statsData.avgTaxRate.toFixed(3)}%`}
            trend="Округ Нью-Йорк"
          />
          </div>
        
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] flex flex-col min-h-75">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Динаміка податкових зборів</h3>
          <div className="w-full h-full flex-1">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                  Завантаження даних...
                </div>
            ):(
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{top:0,right:0,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="colorTaxes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a44625" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a44625" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6"/>
              <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{fill:'#9CA3AF', fontSize:12}}
                  dy={10}
              />
              <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 12}} 
                  tickFormatter={(value) => `$${value} `}
                  />
                  <Tooltip
                  formatter={(value)=>`${value} $`}
                  contentStyle={{borderRadius:'12px',border:'none',boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  cursor={{stroke:'#a44625',strokeWidth:1,strokeDasharray:'3 3'}}
                  />
              <Area 
              type="monotone"
              dataKey="taxes"
              name='Податки'
              stroke="#a44625"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTaxes)"
              />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>
        </div>
        <RecentActivity activities={activities} />
      </main>
    </div>
  );
}

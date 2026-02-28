'use client'

import { useRouter } from "next/navigation"
import { useState } from "react"
import { DroneIcon } from "./components/icons/DroneIcon"
import { Eye,EyeOff,Calculator,FileText, BarChart3,Navigation, Package, Leaf} from "lucide-react"
import { ImageWithFallback } from "./components/icons/ImageWithFallback"

export default function LoginPage(){
    const router=useRouter()
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [showPassword,setShowPassword]=useState(false)
    
    const handleLogin=async (event:any)=>{
        event.preventDefault()
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            const res=await fetch(`${API_URL}/api/auth/login`,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({email,password}),
                credentials:'include'
            })
            if(res.ok){
                const data=await res.json()
                document.cookie = `user_token=${data.token}; path=/; max-age=86400;`;
                router.push('/admin')
            }

        } catch (error) {
            console.error("Помилка з'єднання з сервером:", error);
        }
    }

    return (
        <div className="h-screen grid grid-cols-1 md:grid-cols-2 bg-white overflow-hidden">
            <div className="flex flex-col justify-center items-center p-8 md:p-16">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full  flex items-center justify-center text-2xl text-[#a44625]">
                                <DroneIcon className="w-12 h-12" strokeWidth={1.5}/>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-black">Admin Panel</h2>
                        <p className="text-sm text-gray-500">Wellness Kit Drone Delivery Management</p>
                    </div>
                    <form className="space-y-1" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Adress</label>
                        <input
                        type="email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition"
                        placeholder="admin@wellnessdelivery.com"
                        />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <div className="relative">
                            <input
                            type={showPassword ? 'text':'password'}
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent outline-none transition"
                            placeholder="Enter your password"
                            />
                            <button type="button"
                            onClick={()=>setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                            >
                            {showPassword ? <EyeOff className="w-5 h-5"/>:<Eye className="w-5 g-5"/>}
                            </button>
                            </div>
                        </div>
                        <button 
                        type="submit"
                        className="w-full py-3.5 mt-4 text-white font-medium bg-[#a44625] hover:bg-[#8b3b1f] rounded-lg transition-colors shadow-md">
                            Sign In
                        </button>
                    </form>
                    <div className="h-px w-full bg-gray-200"></div>
                    <div className="text-center">
                        <p className="text-xs text-gray-400 mb-4">Manage your operations</p>
                        <div className="flex justify-center gap-6  text-xs text-gray-500">
                            <div className="flex flex-col items-center gap-2 cursor-pointer hover:text-gray-800 transition">
                               <div className="p-2.5 bg-[#a44625]/10 rounded-full text-[#a44625] hover:bg-[#a44625]/20 transition">
                               <Calculator className="w-5 h-5" strokeWidth={1.5}/>
                               </div>
                                <span className="font-medium">Calculate Taxes</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 cursor-pointer hover:text-gray-800 transition">
                               <div className="p-2.5 bg-[#a44625]/10 rounded-full text-[#a44625] hover:bg-[#a44625]/20 transition">
                               <BarChart3 className="w-5 h-5" strokeWidth={1.5}/>
                               </div>
                                <span className="font-medium">Check Statistics</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 cursor-pointer hover:text-gray-800 transition">
                               <div className="p-2.5 bg-[#a44625]/10 rounded-full text-[#a44625] hover:bg-[#a44625]/20 transition">
                               <FileText className="w-5 h-5" strokeWidth={1.5}/>
                               </div>
                                <span className="font-medium">Generate Reports</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-3">© 2026 Wellness Drone Delivery. All rights reserved.</p>
                    </div>
                </div>
            </div>
            <div className="hidden md:flex flex-col justify-center relative p-12 lg:p-12 overflow-hidden bg-[#a44625]">
               <ImageWithFallback 
                   src="/drone-bg.jpg"
                   alt="Drone Delivery Background"
                   className="absolute inset-0 w-full h-full object-cover z-0 mix-blend-overlay opacity-30"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent z-0"></div>

                <div className="relative z-10 text-white max-w-xl">
                    <h1 className="text-2xl lg:text-4xl font-bold leading-tight mb-6">
                        Delivering Wellness from the Sky
                    </h1>
                    <p className="text-white/80 mb-8 text-lg">
                    Experience the future of health and wellness delivery with our advanced drone fleet. Fast, sustainable, and reliable.
                    </p>
                    <div className="space-y-2.5">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-3 px-4 flex items-center gap-4 hover:bg-white/20 transition cursor-default">
                        <div className="bg-white/20 p-2.5 rounded-full shrink-0">
                        <DroneIcon className="w-4 h-4 text-white" />
                        </div>
                         <div>
                            <h3 className="font-semibold text-white text-lg">Autonomous Delivery</h3>
                            <p className="text-white/70 text-sm mt-1">Track and manage your drone fleet in real-time</p>
                         </div>
                        </div>
                         <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-3 px-4 flex items-center gap-4 hover:bg-white/20 transition cursor-default">
                        <div className="bg-white/20 p-2.5 rounded-full shrink-0">
                        <Package className="w-4 h-4 text-white" />
                        </div>
                         <div>
                            <h3 className="font-semibold text-white text-lg">Curated Wellness Kits</h3>
                            <p className="text-white/70 text-sm mt-1">Manage inventory and customize wellness packages</p>
                         </div>
                        </div>
                         <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl py-3 px-4 flex items-center gap-4 hover:bg-white/20 transition cursor-default">
                        <div className="bg-white/20 p-2.5 rounded-full shrink-0">
                        <Leaf className="w-4 h-4 text-white" />
                        </div>
                         <div>
                            <h3 className="font-semibold text-white text-lg">Eco-Friendly Operations</h3>
                            <p className="text-white/70 text-sm mt-1">Sustainable delivery with zero emissions</p>
                         </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
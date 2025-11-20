import React, { useState } from "react"
import { Gift, Users, Shuffle, Settings, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

export default function App() {
  const [participants, setParticipants] = useState([])
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState({ serviceId: "", templateId: "", publicKey: "" })

  const add = () => {
    if (!name.trim() || !email.trim()) return setMessage("Preenche tudo!")
    if (!email.includes("@")) return setMessage("Email inválido!")
    if (participants.some(p => p.email === email)) return setMessage("Email já existe!")
    setParticipants([...participants, { name: name.trim(), email: email.trim() }])
    setName(""); setEmail(""); setMessage("Adicionado!")
    setTimeout(() => setMessage(""), 3000)
  }

  const draw = async () => {
    if (participants.length < 3) return setMessage("Mínimo 3 pessoas!")
    if (!config.serviceId || !config.templateId || !config.publicKey) return setMessage("Configura o EmailJS primeiro!")

    setLoading(true)
    let shuffled = participants
    let tries = 0
    while (shuffled.some((p, i) => p.email === participants[i].email) && tries < 100) {
      shuffled = [...participants].sort(() => Math.random() - 0.5)
      tries++
    }

    for (let i = 0; i < participants.length; i++) {
      const giver = participants[i]
      const receiver = shuffled[i]
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: config.serviceId,
          template_id: config.templateId,
          user_id: config.publicKey,
          template_params: { to_name: giver.name, to_email: giver.email, secret_friend: receiver.name }
        })
      })
      await new Promise(r => setTimeout(r, 600))
    }
    setLoading(false)
    setMessage("Sorteio enviado com sucesso! 🎉")
    setTimeout(() => { setParticipants([]); setMessage("") }, 5000)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 relative">
          <button onClick={() => setShowConfig(!showConfig)} className="absolute right-0 top-0 p-3">
            <Settings className="w-8 h-8" />
          </button>
          <div className="flex justify-center items-center gap-4 mb-4">
            <Gift className="w-16 h-16 text-red-600" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
              Amigo Oculto 2025
            </h1>
            <Gift className="w-16 h-16 text-green-600" />
          </div>
        </div>

        {showConfig && (
          <div className="bg-white rounded-xl shadow-xl p-6 mb-8 grid md:grid-cols-3 gap-4">
            <input placeholder="Service ID" value={config.serviceId} onChange={e => setConfig({...config, serviceId: e.target.value})} className="p-3 border rounded-lg" />
            <input placeholder="Template ID" value={config.templateId} onChange={e => setConfig({...config, templateId: e.target.value})} className="p-3 border rounded-lg" />
            <input placeholder="Public Key" value={config.publicKey} onChange={e => setConfig({...config, publicKey: e.target.value})} className="p-3 border rounded-lg" />
          </div>
        )}

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex gap-3 ${message.includes("sucesso") ? "bg-green-100" : "bg-red-100"}`}>
            {message.includes("sucesso") ? <CheckCircle2 /> : <AlertCircle />}
            <span>{message}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} className="p-4 border rounded-lg text-lg" />
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} className="p-4 border rounded-lg text-lg" />
          </div>
          <button onClick={add} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg text-xl font-bold">Adicionar</button>
        </div>

        {participants.length > 0 && (
          <div className="bg-white rounded-xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Participantes ({participants.length})</h2>
            {participants.map(p => (
              <div key={p.email} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mb-3">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-600">{p.email}</p>
                </div>
                <button onClick={() => setParticipants(participants.filter(x => x.email !== p.email))} className="text-red-600">Remover</button>
              </div>
            ))}
          </div>
        )}

        {participants.length >= 3 && (
          <div className="text-center">
            <button onClick={draw} disabled={loading} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-16 py-8 rounded-full text-2xl font-bold flex items-center gap-4 mx-auto">
              {loading ? <Loader2 className="animate-spin w-10 h-10" /> : <Shuffle className="w-10 h-10" />}
              {loading ? "Sorteando..." : "Realizar Sorteio!"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
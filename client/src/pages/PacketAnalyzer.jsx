import React, { useState } from 'react';
import { Wifi, Search, Code, Eye, FileText, ChevronRight, Layers } from 'lucide-react';

const MOCK_PACKETS = [
  {
    no: 1,
    time: '0.000000',
    src: '192.168.1.105',
    dst: '192.168.1.1',
    proto: 'DNS',
    length: 78,
    info: 'Standard query 0x1a2b A v8a9f8s9d8f9s8d9f8.exfil.attacker.com',
    hex: '00 11 22 33 44 55 66 77 88 99 aa bb 08 00 45 00 00 40 1c 46 40 00 40 11 73 ca c0 a8 01 69 c0 a8 01 01 00 35 00 35',
    tree: {
      'Frame 1': '78 bytes on wire, 78 bytes captured',
      'Ethernet II': 'Src: 00:11:22:33:44:55, Dst: 00:22:33:44:55:66',
      'Internet Protocol Version 4': 'Src: 192.168.1.105, Dst: 192.168.1.1',
      'User Datagram Protocol': 'Src Port: 53531, Dst Port: 53',
      'Domain Name System (query)': 'Queries: v8a9f8s9d8f9s8d9f8.exfil.attacker.com: type A, class IN'
    }
  },
  {
    no: 2,
    time: '0.012450',
    src: '45.33.32.156',
    dst: '10.0.4.15',
    proto: 'HTTP',
    length: 342,
    info: "GET /api/users?id=1' UNION SELECT username, password FROM users-- HTTP/1.1",
    hex: '47 45 54 20 2f 61 70 69 2f 75 73 65 72 73 3f 69 64 3d 31 27 20 55 4e 49 4f 4e 20 53 45 4c 45 43 54 20 75 73 65 72',
    tree: {
      'Frame 2': '342 bytes on wire',
      'Ethernet II': 'Src: 45:33:32:156, Dst: 10.0.4.15',
      'Transmission Control Protocol': 'Src Port: 44321, Dst Port: 80, Seq: 1, Ack: 1',
      'Hypertext Transfer Protocol': 'GET /api/users?id=1\' UNION SELECT username, password FROM users-- HTTP/1.1\\r\\nHost: victim.corp\\r\\nUser-Agent: sqlmap/1.5\\r\\n'
    }
  },
  {
    no: 3,
    time: '0.045120',
    src: '185.220.101.5',
    dst: '192.168.1.10',
    proto: 'TCP',
    length: 66,
    info: '44321 → 22 [SYN] Seq=0 Win=64240 Len=0 MSS=1460',
    hex: '00 0c 29 e4 ff 12 00 50 56 c0 00 08 08 00 45 00 00 34 8f 32 40 00 40 06 db b7 b9 dc 65 05 c0 a8 01 0a ad 21 00 16',
    tree: {
      'Frame 3': '66 bytes on wire',
      'Transmission Control Protocol': 'Src Port: 44321, Dst Port: 22 (SSH), Flags: SYN'
    }
  }
];

export default function PacketAnalyzer() {
  const [selectedPacket, setSelectedPacket] = useState(MOCK_PACKETS[0]);
  const [filter, setFilter] = useState('');

  const filtered = MOCK_PACKETS.filter(p =>
    filter ? p.proto.toLowerCase().includes(filter.toLowerCase()) || p.info.toLowerCase().includes(filter.toLowerCase()) : true
  );

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <Wifi className="w-6 h-6 text-sky-600 mr-2" />
          Wireshark-Equivalent Integrated Web Packet Analyzer
        </h2>
        <p className="text-xs text-slate-500">Inspect offline PCAPs, frame trees, hex payloads, and protocol dissections</p>
      </div>

      {/* Filter Bar */}
      <div className="soc-card p-4 flex items-center space-x-3">
        <span className="text-xs font-bold text-slate-700">Display Filter:</span>
        <input
          type="text"
          placeholder="e.g. dns, http, tcp.port == 80..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
        />
      </div>

      {/* Packet List Table */}
      <div className="soc-card p-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Captured Packets</h3>
        <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-56">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="p-2">No.</th>
                <th className="p-2">Time</th>
                <th className="p-2">Source</th>
                <th className="p-2">Destination</th>
                <th className="p-2">Protocol</th>
                <th className="p-2">Length</th>
                <th className="p-2">Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map(p => (
                <tr
                  key={p.no}
                  onClick={() => setSelectedPacket(p)}
                  className={`cursor-pointer ${selectedPacket.no === p.no ? 'bg-sky-100 font-semibold text-sky-900' : 'hover:bg-slate-50'}`}
                >
                  <td className="p-2 text-slate-500">{p.no}</td>
                  <td className="p-2 text-slate-600">{p.time}</td>
                  <td className="p-2 text-slate-800">{p.src}</td>
                  <td className="p-2 text-slate-800">{p.dst}</td>
                  <td className="p-2 font-bold text-indigo-700">{p.proto}</td>
                  <td className="p-2 text-slate-600">{p.length}</td>
                  <td className="p-2 text-slate-800 truncate max-w-sm">{p.info}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dissection Details & Hex View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Packet Details Tree */}
        <div className="soc-card p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
            <Layers className="w-4 h-4 text-indigo-600 mr-2" />
            Packet Details Dissection Tree (Frame #{selectedPacket.no})
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs font-mono text-slate-800">
            {Object.entries(selectedPacket.tree).map(([key, val], idx) => (
              <div key={idx} className="border-b border-slate-200 pb-1.5 last:border-0">
                <span className="font-bold text-indigo-900 flex items-center">
                  <ChevronRight className="w-3 h-3 text-sky-600 mr-1" />
                  {key}:
                </span>
                <p className="text-slate-600 pl-4">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hex & ASCII View */}
        <div className="soc-card p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
            <Code className="w-4 h-4 text-emerald-600 mr-2" />
            Raw Hex Bytes & ASCII Inspection
          </h3>
          <div className="bg-slate-900 text-emerald-400 p-4 rounded-lg text-xs font-mono overflow-x-auto max-h-56 leading-relaxed">
            {selectedPacket.hex}
          </div>
        </div>
      </div>
    </div>
  );
}

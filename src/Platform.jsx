import React, { useEffect, useMemo, useState } from "react";
import mqtt from "mqtt";
import {
  Shield,
  Wifi,
  WifiOff,
  MapPin,
  User,
  AlertTriangle,
  Home,
  Bell,
  Cpu,
  Phone,
  Siren,
  Activity,
  Radio,
  Flame,
  Building2,
  Map,
  TowerControl,
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";

const UID = "7b5f486ef57548e8a6fb63381663c002";
const MQTT_URL = "wss://bemfa.com:9504/wss";

const TOPIC_DEVICE = "fire0device";
const TOPIC_STATUS = "fire0status";
const TOPIC_ZONE = "fire0zone";
const TOPIC_VALUE = "fire0value";

function Panel({ title, icon, children, accent = "#38bdf8", style = {} }) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(8,20,40,0.96) 0%, rgba(5,14,28,0.98) 100%)",
        border: `1px solid ${accent}33`,
        borderRadius: "20px",
        boxShadow: `0 0 0 1px ${accent}12 inset, 0 0 24px ${accent}10`,
        padding: "16px",
        color: "#e2e8f0",
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#93c5fd",
          fontSize: "14px",
          marginBottom: "14px",
          fontWeight: 700,
          letterSpacing: "0.5px",
        }}
      >
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function DataRow({ label, value, important = false }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "110px 1fr",
        gap: "8px",
        alignItems: "start",
        padding: "8px 0",
        borderBottom: "1px solid rgba(148,163,184,0.10)",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: "14px" }}>{label}</div>
      <div
        style={{
          color: important ? "#f8fafc" : "#cbd5e1",
          fontSize: important ? "18px" : "15px",
          fontWeight: important ? 800 : 500,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MetricCard({ label, value, color = "#38bdf8", sub = "" }) {
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.72)",
        border: `1px solid ${color}30`,
        borderRadius: "18px",
        padding: "14px",
        minHeight: "110px",
        boxShadow: `0 0 18px ${color}10 inset`,
      }}
    >
      <div style={{ fontSize: "13px", color: "#94a3b8" }}>{label}</div>
      <div
        style={{ marginTop: "10px", fontSize: "34px", fontWeight: 900, color }}
      >
        {value}
      </div>
      {sub ? (
        <div style={{ marginTop: "8px", fontSize: "12px", color: "#64748b" }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

export default function Platform() {
  const [connected, setConnected] = useState(false);
  const [deviceId, setDeviceId] = useState("HHD001");
  const [status, setStatus] = useState("SAFE");
  const [zone, setZone] = useState("未绑定区域");
  const [value, setValue] = useState("F1=1,F2=1,SMK=0");
  const [logs, setLogs] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState({
    ownerName: "未登记",
    phone: "未登记",
    address: "未登记",
    room: "未登记",
  });
  const [nowText, setNowText] = useState("");

  const pushLog = (text) => {
    setLogs((prev) =>
      [`${new Date().toLocaleTimeString()}  ${text}`, ...prev].slice(0, 18),
    );
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setNowText(
        now.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const client = mqtt.connect(MQTT_URL, {
      clientId: UID,
      clean: true,
      reconnectPeriod: 1500,
      connectTimeout: 10000,
      protocolVersion: 4,
    });

    client.on("connect", () => {
      setConnected(true);
      pushLog("平台 MQTT 已连接");

      [TOPIC_DEVICE, TOPIC_STATUS, TOPIC_ZONE, TOPIC_VALUE].forEach((topic) => {
        client.subscribe(topic, { qos: 0 }, (err) => {
          pushLog(err ? `订阅失败: ${topic}` : `订阅成功: ${topic}`);
        });
      });
    });

    client.on("reconnect", () => {
      pushLog("平台正在重连 MQTT...");
    });

    client.on("close", () => {
      setConnected(false);
      pushLog("平台 MQTT 已断开");
    });

    client.on("error", (err) => {
      pushLog(`平台连接错误: ${err.message}`);
    });

    client.on("message", (topic, payload) => {
      const msg = payload.toString().trim();
      pushLog(`收到 ${topic}: ${msg}`);

      if (topic === TOPIC_DEVICE && msg) setDeviceId(msg);
      if (topic === TOPIC_STATUS) setStatus(msg);
      if (topic === TOPIC_ZONE && msg) setZone(msg);
      if (topic === TOPIC_VALUE) setValue(msg);
    });

    return () => {
      client.end(true);
    };
  }, []);

  useEffect(() => {
    if (!deviceId) return;

    pushLog(`开始监听 Firestore: ${deviceId}`);

    const unsub = onSnapshot(
      doc(db, "devices", deviceId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setDeviceInfo({
            ownerName: data.ownerName || "未登记",
            phone: data.phone || "未登记",
            address: data.address || "未登记",
            room: data.room || "未登记",
          });
          pushLog(`已同步绑定信息: ${deviceId}`);
        } else {
          setDeviceInfo({
            ownerName: "未登记",
            phone: "未登记",
            address: "未登记",
            room: "未登记",
          });
          pushLog(`未找到绑定信息: ${deviceId}`);
        }
      },
      (error) => {
        console.error(error);
        pushLog(`读取绑定信息失败: ${error.message}`);
      },
    );

    return () => unsub();
  }, [deviceId]);

  const statusText = useMemo(() => {
    if (status === "SAFE") return "安全";
    if (status === "FIRE") return "着火报警";
    if (status === "GAS_LEAK") return "燃气泄漏";
    if (status === "GAS_FIRE") return "燃气着火";
    return "未知";
  }, [status]);

  const theme = useMemo(() => {
    if (status === "SAFE") {
      return {
        main: "#22c55e",
        glow: "rgba(34,197,94,0.18)",
        soft: "rgba(34,197,94,0.10)",
        text: "#86efac",
        title: "当前全市重点警情：无高危事件",
        hint: "平台运行正常，当前接入家庭终端持续在线监测中",
      };
    }
    if (status === "FIRE") {
      return {
        main: "#ef4444",
        glow: "rgba(239,68,68,0.20)",
        soft: "rgba(239,68,68,0.12)",
        text: "#fca5a5",
        title: "当前全市重点警情：家庭着火报警",
        hint: "平台已接收到重点火情，请指挥中心立即调度处置",
      };
    }
    if (status === "GAS_LEAK") {
      return {
        main: "#f59e0b",
        glow: "rgba(245,158,11,0.20)",
        soft: "rgba(245,158,11,0.12)",
        text: "#fcd34d",
        title: "当前全市重点警情：燃气泄漏预警",
        hint: "平台已接收到燃气泄漏预警，请尽快联系住户并核查",
      };
    }
    return {
      main: "#f43f5e",
      glow: "rgba(244,63,94,0.22)",
      soft: "rgba(244,63,94,0.12)",
      text: "#fda4af",
      title: "当前全市重点警情：燃气着火高危事件",
      hint: "平台已接收到高危复合警情，请立即启动紧急处置流程",
    };
  }, [status]);

  const parsedMetrics = useMemo(() => {
    const result = { F1: "-", F2: "-", SMK: "-" };
    value.split(",").forEach((part) => {
      const [k, v] = part.split("=");
      if (k && v) result[k.trim()] = v.trim();
    });
    return result;
  }, [value]);

  // 城市级演示数据
  const cityStats = {
    familyCount: "12,846",
    onlineDevices: connected ? "12,103" : "11,982",
    todayAlerts: status === "SAFE" ? "27" : "28",
    handlingAlerts: status === "SAFE" ? "1" : "2",
  };

  const districtTag = useMemo(() => {
    if (deviceInfo.address.includes("长宁")) return "长宁区";
    if (deviceInfo.address.includes("浦东")) return "浦东新区";
    if (deviceInfo.address.includes("徐汇")) return "徐汇区";
    return "上海市接入区域";
  }, [deviceInfo.address]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(14,165,233,0.12), transparent 28%), linear-gradient(180deg, #020817 0%, #071326 45%, #08111f 100%)",
        padding: "18px",
        fontFamily: "system-ui, sans-serif",
        color: "#e2e8f0",
      }}
    >
      <div
        style={{
          maxWidth: "1500px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            position: "relative",
            background:
              "linear-gradient(180deg, rgba(10,25,49,0.98), rgba(5,14,28,0.98))",
            border: "1px solid rgba(56,189,248,0.25)",
            borderRadius: "28px",
            padding: "18px 24px",
            boxShadow:
              "0 0 0 1px rgba(56,189,248,0.08) inset, 0 0 32px rgba(56,189,248,0.08)",
            display: "grid",
            gridTemplateColumns: "220px 1fr 220px",
            alignItems: "center",
          }}
        >
          <div />
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "36px",
                fontWeight: 900,
                color: "#f8fafc",
                letterSpacing: "1px",
              }}
            >
              上海市智慧消防大数据平台
            </div>
            <div
              style={{ marginTop: "8px", fontSize: "15px", color: "#93c5fd" }}
            >
              城市级家庭消防预警与联动处置中心
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "999px",
                background: connected
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(148,163,184,0.12)",
                color: connected ? "#86efac" : "#cbd5e1",
                border: connected
                  ? "1px solid rgba(34,197,94,0.28)"
                  : "1px solid rgba(148,163,184,0.18)",
                fontWeight: 700,
              }}
            >
              {connected ? <Wifi size={18} /> : <WifiOff size={18} />}
              {connected ? "平台在线" : "平台离线"}
            </div>
            <div style={{ fontSize: "14px", color: "#94a3b8" }}>{nowText}</div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          <MetricCard
            label="接入家庭总数"
            value={cityStats.familyCount}
            color="#38bdf8"
            sub="城市级接入终端总量"
          />
          <MetricCard
            label="在线设备总数"
            value={cityStats.onlineDevices}
            color="#22c55e"
            sub="当前在线监测终端数量"
          />
          <MetricCard
            label="今日预警事件"
            value={cityStats.todayAlerts}
            color="#f59e0b"
            sub="含火焰 / 燃气异常事件"
          />
          <MetricCard
            label="当前处置警情"
            value={cityStats.handlingAlerts}
            color={theme.main}
            sub="平台当前重点处置事件数"
          />
        </div>

        <div
          style={{
            borderRadius: "24px",
            border: `1px solid ${theme.main}55`,
            background: `linear-gradient(180deg, ${theme.soft}, rgba(8,15,27,0.92))`,
            boxShadow: `0 0 0 1px ${theme.main}20 inset, 0 0 36px ${theme.glow}`,
            padding: "18px 22px",
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "14px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              display: "grid",
              placeItems: "center",
              background: `${theme.main}18`,
              border: `1px solid ${theme.main}55`,
            }}
          >
            <Siren size={34} color={theme.main} />
          </div>

          <div>
            <div
              style={{ fontSize: "30px", fontWeight: 900, color: theme.text }}
            >
              {theme.title}
            </div>
            <div
              style={{ marginTop: "8px", fontSize: "17px", color: "#e2e8f0" }}
            >
              {theme.hint}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr 360px",
            gap: "16px",
            alignItems: "stretch",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <Panel
              title="城市接入概览"
              icon={<Building2 size={16} />}
              accent="#38bdf8"
            >
              <div style={{ display: "grid", gap: "12px" }}>
                <MetricCard
                  label="当前重点设备"
                  value={deviceId}
                  color="#38bdf8"
                />
                <MetricCard label="警情所在区域" value={zone} color="#67e8f9" />
                <MetricCard
                  label="事件所在行政区"
                  value={districtTag}
                  color="#a78bfa"
                />
              </div>
            </Panel>

            <Panel
              title="设备原始状态"
              icon={<Activity size={16} />}
              accent="#22d3ee"
            >
              <div style={{ display: "grid", gap: "10px" }}>
                <DataRow
                  label="火焰传感器1"
                  value={parsedMetrics.F1}
                  important
                />
                <DataRow
                  label="火焰传感器2"
                  value={parsedMetrics.F2}
                  important
                />
                <DataRow
                  label="烟雾 / 燃气值"
                  value={parsedMetrics.SMK}
                  important
                />
              </div>
            </Panel>

            <Panel
              title="平台联动摘要"
              icon={<Radio size={16} />}
              accent="#818cf8"
            >
              <div
                style={{
                  display: "grid",
                  gap: "10px",
                  color: "#cbd5e1",
                  fontSize: "14px",
                }}
              >
                <div>• Firestore 已完成住户信息同步</div>
                <div>• MQTT 正实时接收家庭终端报警</div>
                <div>• 平台按设备编号自动关联住户地址</div>
                <div>• 支持扩展消防员便携接警终端</div>
              </div>
            </Panel>
          </div>

          <Panel
            title="城市态势与当前重点警情"
            icon={<Map size={16} />}
            accent={theme.main}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 0.9fr",
                gap: "16px",
              }}
            >
              <div
                style={{
                  minHeight: "500px",
                  borderRadius: "22px",
                  position: "relative",
                  overflow: "hidden",
                  background:
                    "radial-gradient(circle at 50% 30%, rgba(56,189,248,0.12), transparent 26%), linear-gradient(180deg, rgba(10,25,49,0.96), rgba(3,10,20,1))",
                  border: "1px solid rgba(56,189,248,0.18)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    opacity: 0.45,
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: "14%",
                    left: "12%",
                    width: "22%",
                    height: "18%",
                    border: "1px solid rgba(56,189,248,0.24)",
                    background: "rgba(15,23,42,0.38)",
                    borderRadius: "18px",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "24%",
                    left: "42%",
                    width: "24%",
                    height: "16%",
                    border: "1px solid rgba(56,189,248,0.24)",
                    background: "rgba(15,23,42,0.32)",
                    borderRadius: "18px",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "52%",
                    left: "18%",
                    width: "20%",
                    height: "14%",
                    border: "1px solid rgba(56,189,248,0.24)",
                    background: "rgba(15,23,42,0.34)",
                    borderRadius: "18px",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "48%",
                    left: "56%",
                    width: "22%",
                    height: "18%",
                    border: "1px solid rgba(56,189,248,0.24)",
                    background: "rgba(15,23,42,0.40)",
                    borderRadius: "18px",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: "30%",
                    left: "58%",
                    transform: "translate(-50%, -50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "999px",
                      background: theme.main,
                      boxShadow: `0 0 22px ${theme.main}`,
                    }}
                  />
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#f8fafc",
                      fontWeight: 700,
                      background: "rgba(2,6,23,0.8)",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      border: `1px solid ${theme.main}55`,
                    }}
                  >
                    {districtTag}
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "58%",
                    transform: "translate(-50%, -50%)",
                    width: "78%",
                    background: "rgba(2,6,23,0.90)",
                    border: `1px solid ${theme.main}66`,
                    borderRadius: "20px",
                    padding: "18px",
                    boxShadow: `0 0 28px ${theme.glow}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: theme.text,
                      fontWeight: 800,
                    }}
                  >
                    <TowerControl size={18} />
                    当前重点警情
                  </div>

                  <div
                    style={{
                      marginTop: "14px",
                      fontSize: "30px",
                      fontWeight: 900,
                      color: "#f8fafc",
                    }}
                  >
                    {statusText}
                  </div>

                  <div
                    style={{
                      marginTop: "12px",
                      display: "grid",
                      gap: "8px",
                      fontSize: "15px",
                      color: "#cbd5e1",
                    }}
                  >
                    <div>事件行政区：{districtTag}</div>
                    <div>报警区域：{zone}</div>
                    <div>设备编号：{deviceId}</div>
                    <div>住户地址：{deviceInfo.address}</div>
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    left: "18px",
                    bottom: "18px",
                    right: "18px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      background: "rgba(2,6,23,0.78)",
                      border: "1px solid rgba(56,189,248,0.20)",
                      borderRadius: "14px",
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      当前设备
                    </div>
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "18px",
                        fontWeight: 800,
                        color: "#f8fafc",
                      }}
                    >
                      {deviceId}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(2,6,23,0.78)",
                      border: "1px solid rgba(56,189,248,0.20)",
                      borderRadius: "14px",
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      事件区域
                    </div>
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "18px",
                        fontWeight: 800,
                        color: "#f8fafc",
                      }}
                    >
                      {zone}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(2,6,23,0.78)",
                      border: `1px solid ${theme.main}30`,
                      borderRadius: "14px",
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      警情状态
                    </div>
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "18px",
                        fontWeight: 800,
                        color: theme.text,
                      }}
                    >
                      {statusText}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    borderRadius: "20px",
                    background: "rgba(2,6,23,0.76)",
                    border: `1px solid ${theme.main}38`,
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: theme.text,
                      fontWeight: 800,
                    }}
                  >
                    <MapPin size={18} />
                    当前处置住户信息
                  </div>

                  <div
                    style={{
                      marginTop: "14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <DataRow label="设备编号" value={deviceId} important />
                    <DataRow
                      label="联系人"
                      value={deviceInfo.ownerName}
                      important
                    />
                    <DataRow
                      label="联系电话"
                      value={deviceInfo.phone}
                      important
                    />
                    <DataRow
                      label="家庭地址"
                      value={deviceInfo.address}
                      important
                    />
                    <DataRow
                      label="安装区域"
                      value={deviceInfo.room}
                      important
                    />
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: "20px",
                    background: "rgba(2,6,23,0.76)",
                    border: "1px solid rgba(56,189,248,0.18)",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#93c5fd",
                      fontWeight: 800,
                    }}
                  >
                    <AlertTriangle size={18} />
                    实时原始数据
                  </div>
                  <div
                    style={{
                      marginTop: "12px",
                      background: "rgba(15,23,42,0.8)",
                      borderRadius: "16px",
                      padding: "14px",
                      fontSize: "16px",
                      color: "#e2e8f0",
                      wordBreak: "break-all",
                    }}
                  >
                    {value}
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: "20px",
                    background: "rgba(2,6,23,0.76)",
                    border: "1px solid rgba(56,189,248,0.18)",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#93c5fd",
                      fontWeight: 800,
                    }}
                  >
                    <Bell size={18} />
                    平台调度建议
                  </div>
                  <div
                    style={{
                      marginTop: "12px",
                      color: "#cbd5e1",
                      fontSize: "15px",
                      lineHeight: 1.7,
                    }}
                  >
                    {theme.hint}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <Panel
              title="平台状态监测"
              icon={<Shield size={16} />}
              accent={theme.main}
            >
              <div style={{ display: "grid", gap: "12px" }}>
                <MetricCard
                  label="平台状态"
                  value={connected ? "在线" : "离线"}
                  color={connected ? "#22c55e" : "#94a3b8"}
                />
                <MetricCard
                  label="当前警情"
                  value={statusText}
                  color={theme.main}
                />
                <MetricCard
                  label="住户区域"
                  value={deviceInfo.room}
                  color="#a78bfa"
                />
              </div>
            </Panel>

            <Panel title="日志摘要" icon={<User size={16} />} accent="#38bdf8">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {logs.slice(0, 6).length === 0 ? (
                  <div style={{ fontSize: "14px", color: "#94a3b8" }}>
                    暂无日志
                  </div>
                ) : (
                  logs.slice(0, 6).map((log, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(15,23,42,0.72)",
                        borderRadius: "14px",
                        padding: "10px 12px",
                        fontSize: "12px",
                        color: "#cbd5e1",
                        wordBreak: "break-all",
                        border: "1px solid rgba(56,189,248,0.10)",
                      }}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        </div>

        <Panel title="平台事件日志" icon={<User size={16} />} accent="#38bdf8">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {logs.length === 0 ? (
              <div style={{ fontSize: "14px", color: "#94a3b8" }}>暂无日志</div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(15,23,42,0.72)",
                    borderRadius: "14px",
                    padding: "12px 14px",
                    fontSize: "13px",
                    color: "#cbd5e1",
                    wordBreak: "break-all",
                    border: "1px solid rgba(56,189,248,0.10)",
                  }}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

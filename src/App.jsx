import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Shield,
  Wifi,
  WifiOff,
  Home,
  Bell,
  QrCode,
  Save,
  Trash2,
  MapPin,
  Siren,
  CheckCircle2,
  MoonStar,
  Eye,
} from "lucide-react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const STORAGE_KEY = "huohuodun_binding_info";

const DEFAULT_BINDING = {
  deviceId: "HHD001",
  ownerName: "",
  phone: "",
  address: "",
  room: "客厅",
};

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(8px)",
        borderRadius: "28px",
        padding: "18px",
        boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
        border: "1px solid rgba(255,255,255,0.6)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon, text, sub }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#475569",
          fontSize: "14px",
          fontWeight: 800,
        }}
      >
        {icon}
        {text}
      </div>
      {sub ? (
        <div style={{ marginTop: "6px", color: "#94a3b8", fontSize: "12px" }}>
          {sub}
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div
        style={{
          marginBottom: "7px",
          fontSize: "13px",
          color: "#475569",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        border: "none",
        borderRadius: "18px",
        padding: "14px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: 900,
        transition: "all 0.2s ease",
        background: active
          ? "linear-gradient(135deg, #0f172a, #1e293b)"
          : "#dfe7f1",
        color: active ? "#fff" : "#334155",
        boxShadow: active ? "0 8px 20px rgba(15,23,42,0.18)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function OwlHero({ connected }) {
  return (
    <Card
      style={{
        overflow: "hidden",
        background:
          "radial-gradient(circle at top left, rgba(56,189,248,0.16), transparent 30%), linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "14px",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#0f172a",
            }}
          >
            <MoonStar size={20} />
            <span style={{ fontSize: "30px", fontWeight: 900 }}>慧火盾</span>
          </div>
          <div
            style={{
              marginTop: "8px",
              fontSize: "15px",
              color: "#64748b",
              fontWeight: 600,
            }}
          >
            猫头鹰守护模式 · 家庭消防助手
          </div>
          <div
            style={{
              marginTop: "10px",
              fontSize: "13px",
              color: "#94a3b8",
              lineHeight: 1.7,
            }}
          >
            陪伴式家庭安全终端，实时守护火焰、烟雾与燃气风险。
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "108px",
              height: "108px",
              borderRadius: "28px",
              background: "linear-gradient(180deg, #dff5ea 0%, #eef9ff 100%)",
              boxShadow: "inset 0 0 0 1px rgba(15,23,42,0.06)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: "16px",
                width: "28px",
                height: "28px",
                borderRadius: "999px",
                background: "#ffffff",
                boxShadow: "0 0 0 3px rgba(15,23,42,0.05) inset",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "999px",
                  background: "#0f172a",
                }}
              />
            </div>

            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "28px",
                height: "28px",
                borderRadius: "999px",
                background: "#ffffff",
                boxShadow: "0 0 0 3px rgba(15,23,42,0.05) inset",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  width: "12px",
                  height: "12px",
                  borderRadius: "999px",
                  background: "#0f172a",
                }}
              />
            </div>

            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "22px",
                width: "18px",
                height: "18px",
                transform: "rotate(-25deg)",
                background: "#0f172a",
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                opacity: 0.9,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "22px",
                width: "18px",
                height: "18px",
                transform: "rotate(25deg)",
                background: "#0f172a",
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                opacity: 0.9,
              }}
            />

            <div
              style={{
                position: "absolute",
                top: "48px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "14px",
                height: "12px",
                background: "#f59e0b",
                clipPath: "polygon(50% 100%, 0% 0%, 100% 0%)",
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: "-18px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "84px",
                height: "54px",
                borderRadius: "28px 28px 12px 12px",
                background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 12px",
              borderRadius: "999px",
              background: connected ? "#dcfce7" : "#e2e8f0",
              color: connected ? "#15803d" : "#475569",
              fontSize: "14px",
              fontWeight: 800,
            }}
          >
            {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
            {connected ? "云端在线" : "云端离线"}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function App() {
  const messageTimerRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [zone, setZone] = useState("未绑定区域");
  const [status, setStatus] = useState("SAFE");
  const [value, setValue] = useState("F1=1,F2=1,SMK=0");
  const [deviceId, setDeviceId] = useState("HHD001");
  const [legacyAlarm, setLegacyAlarm] = useState("0");
  const [legacyZone, setLegacyZone] = useState("未绑定区域#");

  const [activeTab, setActiveTab] = useState("bind");
  const [formData, setFormData] = useState(DEFAULT_BINDING);
  const [savedBinding, setSavedBinding] = useState(DEFAULT_BINDING);
  const [zoneInput, setZoneInput] = useState("客厅");
  const [saveMessage, setSaveMessage] = useState("");

  const showMessage = (text, duration = 2500) => {
    setSaveMessage(text);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => {
      setSaveMessage("");
    }, duration);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_BINDING, ...parsed };
        setFormData(merged);
        setSavedBinding(merged);
        setZoneInput(merged.room || "客厅");
        if (merged.deviceId) setDeviceId(merged.deviceId);

        const initZone = (merged.room || "").trim();
        if (initZone) {
          setZone(initZone);
          setLegacyZone(`${initZone}#`);
        }
      }
    } catch (error) {
      console.error("读取本地绑定信息失败:", error);
    }
  }, []);

  const currentDeviceId = useMemo(() => {
    return (
      savedBinding.deviceId ||
      formData.deviceId ||
      deviceId ||
      "HHD001"
    ).trim();
  }, [savedBinding.deviceId, formData.deviceId, deviceId]);

  useEffect(() => {
    if (!currentDeviceId) return;

    const unsub = onSnapshot(
      doc(db, "devices", currentDeviceId),
      (snap) => {
        if (!snap.exists()) {
          setConnected(false);
          return;
        }

        const data = snap.data();
        setConnected(true);

        if (data.deviceId) setDeviceId(data.deviceId);
        if (typeof data.status === "string") setStatus(data.status);
        if (typeof data.zone === "string" && data.zone.trim())
          setZone(data.zone);
        if (typeof data.value === "string") setValue(data.value);
        if (typeof data.legacyAlarm === "string")
          setLegacyAlarm(data.legacyAlarm);
        if (typeof data.legacyZone === "string") setLegacyZone(data.legacyZone);

        const nextBinding = {
          deviceId: data.deviceId || currentDeviceId,
          ownerName: data.ownerName || "",
          phone: data.phone || "",
          address: data.address || "",
          room: data.room || "客厅",
        };

        setSavedBinding(nextBinding);
        setFormData(nextBinding);
        setZoneInput(data.zone || nextBinding.room || "客厅");
      },
      (error) => {
        console.error("App 读取 Firebase 失败：", error);
        setConnected(false);
      },
    );

    return () => unsub();
  }, [currentDeviceId]);

  const statusText = useMemo(() => {
    if (status === "SAFE") return "安全守护中";
    if (status === "FIRE") return "着火报警";
    if (status === "GAS_LEAK") return "燃气泄漏";
    if (status === "GAS_FIRE") return "燃气着火";
    if (legacyAlarm === "1") return "着火报警";
    if (legacyAlarm === "2") return "燃气泄漏";
    if (legacyAlarm === "3") return "燃气着火";
    return "状态未知";
  }, [status, legacyAlarm]);

  const statusTheme = useMemo(() => {
    if (statusText === "安全守护中") {
      return {
        bg: "linear-gradient(135deg, #ecfdf5, #f0fdf4)",
        border: "#bbf7d0",
        text: "#166534",
        title: "猫头鹰正在守护你的家",
        hint: "当前环境安全，设备正在安静巡查中。",
      };
    }
    if (statusText === "燃气泄漏") {
      return {
        bg: "linear-gradient(135deg, #fff7ed, #fffbeb)",
        border: "#fed7aa",
        text: "#c2410c",
        title: "猫头鹰发现燃气异常",
        hint: "请立即检查燃气来源，开窗通风，并注意安全。",
      };
    }
    if (statusText === "着火报警") {
      return {
        bg: "linear-gradient(135deg, #fef2f2, #fff1f2)",
        border: "#fecaca",
        text: "#b91c1c",
        title: "猫头鹰发现火情",
        hint: "请立即远离危险区域，并第一时间处理或报警。",
      };
    }
    return {
      bg: "linear-gradient(135deg, #fff1f2, #fdf2f8)",
      border: "#fecdd3",
      text: "#be123c",
      title: "猫头鹰发现高危复合警情",
      hint: "系统检测到燃气着火，请立即撤离现场并联系救援。",
    };
  }, [statusText]);

  const parsedMetrics = useMemo(() => {
    const result = { F1: "-", F2: "-", SMK: "-" };
    value.split(",").forEach((part) => {
      const [k, v] = part.split("=");
      if (k && v) result[k.trim()] = v.trim();
    });
    return result;
  }, [value]);

  const updateFormField = (field, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: fieldValue,
    }));
  };

  const saveBindingInfo = async () => {
    try {
      const finalDeviceId = formData.deviceId.trim();
      const finalOwnerName = formData.ownerName.trim();
      const finalPhone = formData.phone.trim();
      const finalAddress = formData.address.trim();
      const finalRoom = formData.room.trim();
      const finalZone = finalRoom || "未绑定区域";
      const finalLegacyZone = `${finalZone}#`;

      if (!finalDeviceId) return showMessage("请先填写设备编号", 2000);
      if (!finalOwnerName) return showMessage("请先填写联系人", 2000);
      if (!finalPhone) return showMessage("请先填写联系电话", 2000);
      if (!finalAddress) return showMessage("请先填写家庭地址", 2000);
      if (!finalRoom) return showMessage("请先填写安装区域", 2000);

      showMessage("正在保存到云端...", 10000);

      await setDoc(
        doc(db, "devices", finalDeviceId),
        {
          deviceId: finalDeviceId,
          ownerName: finalOwnerName,
          phone: finalPhone,
          address: finalAddress,
          room: finalRoom,
          status,
          statusText,
          zone: finalZone,
          value,
          legacyAlarm,
          legacyZone: finalLegacyZone,
          zoneCommand: finalZone,
          zoneCommandUpdatedAt: new Date().toISOString(),
          source: "app-binding",
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      const nextBinding = {
        deviceId: finalDeviceId,
        ownerName: finalOwnerName,
        phone: finalPhone,
        address: finalAddress,
        room: finalRoom,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBinding));
      setSavedBinding(nextBinding);
      setFormData(nextBinding);
      setDeviceId(finalDeviceId);
      setZoneInput(finalZone);
      setZone(finalZone);
      setLegacyZone(finalLegacyZone);

      showMessage("守护者绑定成功，家庭信息已保存到云端", 2500);
    } catch (error) {
      console.error("保存激活失败完整错误：", error);
      console.error("error.code:", error?.code);
      console.error("error.name:", error?.name);
      console.error("error.message:", error?.message);
      console.error("error.stack:", error?.stack);

      showMessage(
        `保存失败：${error?.code || ""} ${error?.message || "请检查 Firebase 配置"}`,
        5000,
      );
    }
  };

  const clearBindingInfo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData({ ...DEFAULT_BINDING });
    setSavedBinding({ ...DEFAULT_BINDING });
    setZoneInput("客厅");
    setDeviceId("HHD001");
    setZone("未绑定区域");
    setLegacyZone("未绑定区域#");
    showMessage("本地绑定信息已清空", 2000);
  };

  const publishZone = async (text) => {
    const finalText = (text ?? zoneInput).trim();

    if (!finalText) {
      showMessage("请输入要发送的区域名称", 2000);
      return;
    }

    const finalDeviceId = (
      currentDeviceId ||
      formData.deviceId ||
      "HHD001"
    ).trim();
    const finalLegacyZone = `${finalText}#`;

    try {
      setZoneInput(finalText);
      setZone(finalText);
      setLegacyZone(finalLegacyZone);

      await setDoc(
        doc(db, "devices", finalDeviceId),
        {
          deviceId: finalDeviceId,
          zone: finalText,
          legacyZone: finalLegacyZone,
          room: savedBinding.room || formData.room || finalText,

          // 这两个字段是给 ESP32 指令轮询用的
          zoneCommand: finalText,
          zoneCommandUpdatedAt: new Date().toISOString(),

          updatedAt: new Date().toISOString(),
          source: "app-zone-command",
        },
        { merge: true },
      );

      showMessage(`区域指令已下发：${finalText}`, 2500);
    } catch (error) {
      console.error("区域同步失败：", error);
      console.error("error.code:", error?.code);
      console.error("error.name:", error?.name);
      console.error("error.message:", error?.message);
      console.error("error.stack:", error?.stack);

      showMessage(
        `区域同步失败：${error?.code || ""} ${error?.message || "请检查 Firebase 配置"}`,
        4000,
      );
    }
  };

  const quickZones = ["客厅", "厨房", "卧室"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(56,189,248,0.16), transparent 22%), linear-gradient(180deg, #edf4fb 0%, #e7eef7 100%)",
        padding: "16px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "450px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <OwlHero connected={connected} />

        <div style={{ display: "flex", gap: "10px" }}>
          <Pill
            active={activeTab === "bind"}
            onClick={() => setActiveTab("bind")}
          >
            设备激活
          </Pill>
          <Pill
            active={activeTab === "monitor"}
            onClick={() => setActiveTab("monitor")}
          >
            守护监控
          </Pill>
        </div>

        {activeTab === "bind" && (
          <>
            <Card>
              <SectionTitle
                icon={<QrCode size={16} />}
                text="激活你的猫头鹰守护者"
                sub="填写家庭信息后，设备将与家庭地址完成绑定。"
              />

              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <Field label="设备编号">
                  <input
                    value={formData.deviceId}
                    onChange={(e) =>
                      updateFormField("deviceId", e.target.value)
                    }
                    placeholder="如：HHD001"
                    style={{
                      width: "100%",
                      border: "1px solid #cbd5e1",
                      borderRadius: "18px",
                      padding: "13px 14px",
                      fontSize: "15px",
                      boxSizing: "border-box",
                      outline: "none",
                      background: "#f8fbff",
                    }}
                  />
                </Field>

                <Field label="守护联系人">
                  <input
                    value={formData.ownerName}
                    onChange={(e) =>
                      updateFormField("ownerName", e.target.value)
                    }
                    placeholder="请输入住户姓名"
                    style={{
                      width: "100%",
                      border: "1px solid #cbd5e1",
                      borderRadius: "18px",
                      padding: "13px 14px",
                      fontSize: "15px",
                      boxSizing: "border-box",
                      outline: "none",
                      background: "#f8fbff",
                    }}
                  />
                </Field>

                <Field label="联系电话">
                  <input
                    value={formData.phone}
                    onChange={(e) => updateFormField("phone", e.target.value)}
                    placeholder="请输入联系电话"
                    style={{
                      width: "100%",
                      border: "1px solid #cbd5e1",
                      borderRadius: "18px",
                      padding: "13px 14px",
                      fontSize: "15px",
                      boxSizing: "border-box",
                      outline: "none",
                      background: "#f8fbff",
                    }}
                  />
                </Field>

                <Field label="家庭地址">
                  <textarea
                    value={formData.address}
                    onChange={(e) => updateFormField("address", e.target.value)}
                    placeholder="请输入详细家庭地址"
                    style={{
                      width: "100%",
                      minHeight: "96px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "18px",
                      padding: "13px 14px",
                      fontSize: "15px",
                      boxSizing: "border-box",
                      resize: "vertical",
                      outline: "none",
                      background: "#f8fbff",
                    }}
                  />
                </Field>

                <Field label="安装区域">
                  <input
                    value={formData.room}
                    onChange={(e) => updateFormField("room", e.target.value)}
                    placeholder="如：客厅 / 厨房 / 卧室"
                    style={{
                      width: "100%",
                      border: "1px solid #cbd5e1",
                      borderRadius: "18px",
                      padding: "13px 14px",
                      fontSize: "15px",
                      boxSizing: "border-box",
                      outline: "none",
                      background: "#f8fbff",
                    }}
                  />
                </Field>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <button
                  onClick={saveBindingInfo}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #0f172a, #1e293b)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "18px",
                    padding: "14px",
                    fontSize: "15px",
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    boxShadow: "0 10px 24px rgba(15,23,42,0.16)",
                  }}
                >
                  <Save size={16} />
                  保存激活
                </button>

                <button
                  onClick={clearBindingInfo}
                  style={{
                    flex: 1,
                    background: "#fde8e8",
                    color: "#dc2626",
                    border: "none",
                    borderRadius: "18px",
                    padding: "14px",
                    fontSize: "15px",
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Trash2 size={16} />
                  清空
                </button>
              </div>

              {saveMessage && (
                <div
                  style={{
                    marginTop: "12px",
                    background: "#ecfdf5",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                    borderRadius: "16px",
                    padding: "12px 14px",
                    fontSize: "14px",
                    fontWeight: 800,
                  }}
                >
                  {saveMessage}
                </div>
              )}
            </Card>

            <Card
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,249,255,0.95))",
              }}
            >
              <SectionTitle
                icon={<CheckCircle2 size={16} />}
                text="当前守护者信息"
                sub="这是当前将同步到平台端的家庭信息。"
              />
              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ color: "#334155", fontSize: "15px" }}>
                  <strong>设备编号：</strong>
                  {formData.deviceId || "未填写"}
                </div>
                <div style={{ color: "#334155", fontSize: "15px" }}>
                  <strong>守护联系人：</strong>
                  {formData.ownerName || "未填写"}
                </div>
                <div style={{ color: "#334155", fontSize: "15px" }}>
                  <strong>联系电话：</strong>
                  {formData.phone || "未填写"}
                </div>
                <div style={{ color: "#334155", fontSize: "15px" }}>
                  <strong>家庭地址：</strong>
                  {formData.address || "未填写"}
                </div>
                <div style={{ color: "#334155", fontSize: "15px" }}>
                  <strong>安装区域：</strong>
                  {formData.room || "未填写"}
                </div>
              </div>
            </Card>
          </>
        )}

        {activeTab === "monitor" && (
          <>
            <Card
              style={{
                background: statusTheme.bg,
                border: `2px solid ${statusTheme.border}`,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    borderRadius: "18px",
                    background: "#fff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Siren size={28} color={statusTheme.text} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 900,
                      color: statusTheme.text,
                    }}
                  >
                    {statusTheme.title}
                  </div>
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "14px",
                      color: statusTheme.text,
                    }}
                  >
                    {statusTheme.hint}
                  </div>
                </div>
              </div>
            </Card>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <Card>
                <SectionTitle icon={<Home size={16} />} text="当前巡查区域" />
                <div
                  style={{
                    marginTop: "14px",
                    fontSize: "30px",
                    fontWeight: 900,
                    color: "#0f172a",
                  }}
                >
                  {zone}
                </div>
              </Card>

              <Card>
                <SectionTitle icon={<Shield size={16} />} text="守护状态" />
                <div
                  style={{
                    marginTop: "14px",
                    fontSize: "24px",
                    fontWeight: 900,
                    color: statusTheme.text,
                  }}
                >
                  {statusText}
                </div>
              </Card>
            </div>

            <Card>
              <SectionTitle
                icon={<MapPin size={16} />}
                text="家庭守护档案"
                sub="平台端将使用这份信息进行地址联动与出警辅助。"
              />
              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ color: "#334155", fontSize: "15px" }}>
                  <strong>设备编号：</strong>
                  {savedBinding.deviceId || "未填写"}
                </div>
                <div style={{ color: "#334155", fontSize: "15px" }}>
                  <strong>联系人：</strong>
                  {savedBinding.ownerName || "未填写"}
                </div>
                <div style={{ color: "#334155", fontSize: "15px" }}>
                  <strong>联系电话：</strong>
                  {savedBinding.phone || "未填写"}
                </div>
                <div style={{ color: "#334155", fontSize: "15px" }}>
                  <strong>家庭地址：</strong>
                  {savedBinding.address || "未填写"}
                </div>
                <div style={{ color: "#334155", fontSize: "15px" }}>
                  <strong>安装区域：</strong>
                  {savedBinding.room || "未填写"}
                </div>
              </div>
            </Card>

            <Card>
              <SectionTitle
                icon={<Eye size={16} />}
                text="猫头鹰视线调整"
                sub="设置设备当前监测区域，便于远程同步家庭空间位置。"
              />

              <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                <input
                  value={zoneInput}
                  onChange={(e) => setZoneInput(e.target.value)}
                  placeholder="输入区域名称"
                  style={{
                    flex: 1,
                    border: "1px solid #cbd5e1",
                    borderRadius: "18px",
                    padding: "13px 14px",
                    fontSize: "15px",
                    outline: "none",
                    background: "#f8fbff",
                  }}
                />
                <button
                  onClick={() => publishZone()}
                  style={{
                    background: "linear-gradient(135deg, #0f172a, #1e293b)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "18px",
                    padding: "13px 16px",
                    fontSize: "15px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  发送
                </button>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                {quickZones.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setZoneInput(item);
                      publishZone(item);
                    }}
                    style={{
                      background: "#e8f0f8",
                      color: "#334155",
                      border: "none",
                      borderRadius: "14px",
                      padding: "10px 14px",
                      fontSize: "14px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <SectionTitle
                icon={<Bell size={16} />}
                text="巡查摘要"
                sub="快速查看当前硬件的核心感知数据。"
              />
              <div
                style={{
                  marginTop: "14px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "18px",
                    padding: "12px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    火焰 1
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "24px",
                      fontWeight: 900,
                      color: "#0f172a",
                    }}
                  >
                    {parsedMetrics.F1}
                  </div>
                </div>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "18px",
                    padding: "12px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    火焰 2
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "24px",
                      fontWeight: 900,
                      color: "#0f172a",
                    }}
                  >
                    {parsedMetrics.F2}
                  </div>
                </div>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "18px",
                    padding: "12px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    烟雾值
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "24px",
                      fontWeight: 900,
                      color: "#0f172a",
                    }}
                  >
                    {parsedMetrics.SMK}
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

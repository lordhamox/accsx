import { useEffect, useState } from "react";
import axios from "axios";

export default function AccountSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [edited, setEdited] = useState({});
  const [filterUsers, setFilterUsers] = useState("all");
  const [sortDesc, setSortDesc] = useState(true);

  const baseUrl = "https://app.nocodb.com/api/v2/tables/m14awwng6inqpgu/records";
  const token = "tcH_m4SWp07r_gJI-zH4EcE-vKgfuBE4AXZJtBOE";

  useEffect(() => {
    const fetchAllAccounts = async () => {
      let allRecords = [];
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      try {
        while (hasMore) {
          const res = await axios.get(
            `${baseUrl}?offset=${offset}&limit=${limit}&where=&viewId=vw5pxxb1ozhvu0jd`,
            {
              headers: { "xc-token": token },
            }
          );

          const fetched = res.data.list;
          allRecords = [...allRecords, ...fetched];
          hasMore = fetched.length === limit;
          offset += limit;
        }

        const sorted = allRecords.sort((a, b) => {
          const aDate = new Date(a.CreatedAt || a.created_at || a.date || 0);
          const bDate = new Date(b.CreatedAt || b.created_at || b.date || 0);
          return bDate - aDate;
        });

        setAccounts(sorted);
        setFiltered(sorted);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchAllAccounts();
  }, []);

  useEffect(() => {
    let list = [...accounts];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      list = list.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(lower)
        )
      );
    }

    if (filterUsers !== "all") {
      list = list.filter((item) => String(item.users) === filterUsers);
    }

    if (!sortDesc) {
      list = list.reverse();
    }

    setFiltered(list);
  }, [searchTerm, accounts, filterUsers, sortDesc]);

  const handleEditChange = (key, value) => {
    setEdited((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!selected?.id || Object.keys(edited).length === 0) {
      alert("لا يوجد تعديل للحفظ أو المعرف غير موجود.");
      return;
    }

    try {
      await axios.patch(
        `${baseUrl}/${selected.id}`,
        edited,
        {
          headers: { "xc-token": token },
        }
      );

      const newAccounts = accounts.map((item) =>
        item.id === selected.id ? { ...item, ...edited } : item
      );

      setAccounts(newAccounts);
      setFiltered(newAccounts);
      setSelected(null);
      setEdited({});
    } catch (err) {
      console.error("Error saving update:", err);
      alert("حدث خطأ أثناء الحفظ. تأكد من اتصالك أو صحة البيانات.");
    }
  };

  const resetFilters = () => {
    setFilterUsers("all");
    setSortDesc(true);
    setSearchTerm("");
  };

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <p style={{ color: "gray" }}>عدد الأكونتات: {filtered.length}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <select value={filterUsers} onChange={(e) => setFilterUsers(e.target.value)}>
            <option value="all">الكل</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <button onClick={() => setSortDesc(!sortDesc)}>عكس الترتيب الزمني</button>
          <button onClick={resetFilters}>إعادة التصفية</button>
        </div>
      </div>

      <input
        placeholder="ابحث بالايميل أو اسم الاكونت"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: 20, padding: 10, width: "100%", direction: "rtl" }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
        {filtered.map((acc, idx) => (
          <div
            key={idx}
            style={{ border: "1px solid #ccc", padding: 15, borderRadius: 8, cursor: "pointer" }}
            onClick={() => setSelected(acc)}
          >
            {["Account", "Pass", "Date"].map((key) => (
              acc[key] ? (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontWeight: "bold", color: "#555" }}>{key}:</span>
                  <span style={{ fontWeight: "bold", color: "#000" }}>{acc[key]}</span>
                </div>
              ) : null
            ))}
          </div>
        ))}
      </div>

      {selected && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "white", padding: 20, borderRadius: 8, maxWidth: 500, width: "90%" }}
          >
            <h2 style={{ textAlign: "center", marginBottom: 20 }}>تفاصيل الحساب</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(selected).map(([key, value]) => (
                !["id", "x"].includes(key.toLowerCase()) && (
                  <div key={key}>
                    <label style={{ display: "block", marginBottom: 5 }}>{key}:</label>
                    <input
                      value={edited[key] ?? value?.toString()}
                      onChange={(e) => handleEditChange(key, e.target.value)}
                      onFocus={(e) => e.target.setSelectionRange(0, 0)}
                      style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    />
                  </div>
                )
              ))}
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button onClick={handleSave} style={{ padding: "10px 20px", background: "#0070f3", color: "white", border: "none", borderRadius: 4 }}>
                  حفظ التعديلات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
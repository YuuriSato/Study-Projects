const STORAGE_KEY = "inventario-computadores-v1";
const CORPORATE_EMAILS_KEY = "corporate_emails_v1";
const THEME_KEY = "theme_mode";
const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";
const MOCK_USERS_KEY = "mock_auth_users_v1";
const AUTH_BASE_URL = "/api/auth";
const AUTH_USE_MOCK = true;
const MACHINE_DATA_KEY = "machine_data_v1";

const elements = {
  appShell: document.getElementById("app-shell"),
  navButtons: Array.from(document.querySelectorAll(".nav-btn")),
  dashboardView: document.getElementById("view-dashboard"),
  computersView: document.getElementById("view-computadores"),
  emailsView: document.getElementById("view-emails"),
  modalLayer: document.getElementById("modal-layer"),
  modalTitle: document.getElementById("modal-title"),
  form: document.getElementById("computer-form"),
  tableBody: document.getElementById("table-body"),
  tableCount: document.getElementById("table-count"),
  filterSearch: document.getElementById("filter-search"),
  filterStatus: document.getElementById("filter-status"),
  metricTotal: document.getElementById("metric-total"),
  metricActive: document.getElementById("metric-active"),
  metricSoon: document.getElementById("metric-soon"),
  metricExpired: document.getElementById("metric-expired"),
  commonSpecs: document.getElementById("common-specs"),
  importInput: document.getElementById("import-csv-input"),
  userEmail: document.getElementById("user-email"),
  themeToggle: document.getElementById("theme-toggle"),
  logoutButton: document.getElementById("logout-btn"),
  authLayer: document.getElementById("auth-modal-layer"),
  authTabLogin: document.getElementById("tab-login"),
  authTabRegister: document.getElementById("tab-register"),
  authError: document.getElementById("auth-error"),
  loginForm: document.getElementById("login-form"),
  registerForm: document.getElementById("register-form"),
  corporateEmailForm: document.getElementById("corporate-email-form"),
  corporateEmailInput: document.getElementById("corporate-email-input"),
  computerCorporateEmail: document.getElementById("computer-corporate-email"),
  corporateEmailFeedback: document.getElementById("corporate-email-feedback"),
  corporateEmailCount: document.getElementById("corporate-email-count"),
  corporateEmailTableBody: document.getElementById("corporate-email-table-body"),
};

const state = {
  currentView: "dashboard",
  editingId: null,
  searchTerm: "",
  statusFilter: "todos",
  computers: loadComputers(),
  corporateEmails: loadCorporateEmails(),
  theme: loadTheme(),
  auth: {
    user: loadUser(),
    token: localStorage.getItem(AUTH_TOKEN_KEY),
    isAuthenticated: false,
    loading: false,
    error: "",
    mode: "login"
  }
};

function loadComputers() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (Array.isArray(saved) && saved.length) {
      return saved.map((item) => ({
        ...item,
        deviceStatus: ["ativo", "inativo", "pendente"].includes(item.deviceStatus) ? item.deviceStatus : "ativo",
        corporateEmail: typeof item.corporateEmail === "string" ? item.corporateEmail : ""
      }));
    }
  } catch (error) {
    console.error("Falha ao carregar dados salvos:", error);
  }

  return [
    {
      id: crypto.randomUUID(),
      owner: "Silas Goes",
      serial: "2141",
      machine: "Aspire Go 15",
      deviceStatus: "ativo",
      corporateEmail: "",
      specs: "i7 13635H / 16GB DDR5",
      warrantyDays: 731,
      createdAt: new Date().toISOString()
    }
  ];
}

function loadUser() {
  try {
    const user = JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null");
    return user && typeof user.email === "string" ? user : null;
  } catch (error) {
    return null;
  }
}

function loadCorporateEmails() {
  try {
    const saved = JSON.parse(localStorage.getItem(CORPORATE_EMAILS_KEY) || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) => typeof item?.id === "string" && typeof item?.email === "string");
  } catch (error) {
    return [];
  }
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "dark" ? "dark" : "light";
}
function saveComputers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.computers));
}

function saveCorporateEmails() {
  localStorage.setItem(CORPORATE_EMAILS_KEY, JSON.stringify(state.corporateEmails));
}

function applyTheme() {
  const isDark = state.theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  elements.themeToggle.textContent = isDark ? "Modo Claro" : "Modo Escuro";
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, state.theme);
  applyTheme();
}
function setCorporateFeedback(message, kind = "ok") {
  if (!message) {
    elements.corporateEmailFeedback.textContent = "";
    elements.corporateEmailFeedback.className = "mt-3 hidden text-sm";
    return;
  }
  elements.corporateEmailFeedback.textContent = message;
  elements.corporateEmailFeedback.className =
    kind === "error"
      ? "mt-3 text-sm text-rose-600"
      : "mt-3 text-sm text-emerald-600";
}

function persistAuthSession(payload) {
  state.auth.user = payload.user;
  state.auth.token = payload.token;
  state.auth.isAuthenticated = true;
  localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(payload.user));
}

function clearAuthSession() {
  state.auth.user = null;
  state.auth.token = null;
  state.auth.isAuthenticated = false;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function setAuthError(message) {
  state.auth.error = message;
  if (!message) {
    elements.authError.textContent = "";
    elements.authError.classList.add("hidden");
    return;
  }
  elements.authError.textContent = message;
  elements.authError.classList.remove("hidden");
}

function setAuthMode(mode) {
  state.auth.mode = mode;
  setAuthError("");
  elements.authTabLogin.classList.toggle("bg-white", mode === "login");
  elements.authTabLogin.classList.toggle("text-brand-600", mode === "login");
  elements.authTabRegister.classList.toggle("bg-white", mode === "register");
  elements.authTabRegister.classList.toggle("text-brand-600", mode === "register");
  elements.loginForm.classList.toggle("hidden", mode !== "login");
  elements.registerForm.classList.toggle("hidden", mode !== "register");
}

function setAuthLoading(isLoading) {
  state.auth.loading = isLoading;
  const loginButton = elements.loginForm.querySelector("button[type='submit']");
  const registerButton = elements.registerForm.querySelector("button[type='submit']");
  loginButton.disabled = isLoading;
  registerButton.disabled = isLoading;
  loginButton.classList.toggle("opacity-70", isLoading);
  registerButton.classList.toggle("opacity-70", isLoading);
  loginButton.textContent = isLoading ? "Aguarde..." : "Entrar";
  registerButton.textContent = isLoading ? "Aguarde..." : "Cadastrar e Entrar";
}

function applyAuthGate() {
  const locked = !state.auth.isAuthenticated;
  elements.appShell.classList.toggle("auth-locked", locked);
  elements.authLayer.classList.toggle("hidden", !locked);
  elements.authLayer.classList.toggle("flex", locked);
  elements.userEmail.textContent = state.auth.user?.email || "NÃ£o autenticado";
  elements.logoutButton.classList.toggle("hidden", locked);
}

function renderNav() {
  elements.navButtons.forEach((button) => {
    const active = button.dataset.nav === state.currentView;
    button.classList.toggle("bg-blue-50", active);
    button.classList.toggle("text-brand-600", active);
    button.classList.toggle("text-slate-700", !active);
  });
}

function getRemainingDays(computer) {
  if (computer.purchaseDate && (computer.warrantyMonths || computer.warrantyMonths === 0)) {
    const startDate = new Date(computer.purchaseDate);
    if (!Number.isNaN(startDate.getTime())) {
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + Number(computer.warrantyMonths || 0));
      return Math.ceil((endDate.getTime() - Date.now()) / 86400000);
    }
  }

  const createdAtMs = new Date(computer.createdAt || Date.now()).getTime();
  if (Number.isNaN(createdAtMs)) {
    return Number(computer.warrantyDays) || 0;
  }
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - createdAtMs) / 86400000);
  return Number(computer.warrantyDays) - diffDays;
}

function getWarrantyStatus(computer) {
  const remaining = getRemainingDays(computer);
  if (remaining <= 0) return "vencida";
  if (remaining <= 30) return "proxima";
  return "ativa";
}

function statusBadge(status) {
  if (status === "ativa") {
    return '<span class="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Ativa</span>';
  }
  if (status === "proxima") {
    return '<span class="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">PrÃ³xima</span>';
  }
  return '<span class="inline-flex rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">Vencida</span>';
}

function formatRemaining(remaining) {
  if (remaining <= 0) return "Sem cobertura";
  if (remaining === 1) return "1 dia";
  return `${remaining} dias`;
}

function buildSpecs(payload) {
  const parts = [];
  if (payload.cpu) parts.push(payload.cpu);
  if (payload.ram) parts.push(payload.ram);
  if (payload.gpu) parts.push(payload.gpu);
  if (payload.storage) {
    const storageInfo = payload.storageType ? `${payload.storage} ${payload.storageType}` : payload.storage;
    parts.push(storageInfo.trim());
  }
  if (payload.os) parts.push(payload.os);
  return parts.join(" / ");
}

function renderCorporateEmailOptions(selectedEmail = "") {
  const options = ['<option value="">Sem vínculo</option>'];
  state.corporateEmails.forEach((item) => {
    const selected = item.email === selectedEmail ? "selected" : "";
    options.push(`<option value="${escapeHtml(item.email)}" ${selected}>${escapeHtml(item.email)}</option>`);
  });
  elements.computerCorporateEmail.innerHTML = options.join("");
}


function statusLabel(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "inativo") return "Inativo";
  if (normalized === "pendente") return "Pendente";
  return "Ativo";
}

function deviceStatusBadge(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "inativo") {
    return '<span class="inline-flex rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Inativo</span>';
  }
  if (normalized === "pendente") {
    return '<span class="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Pendente</span>';
  }
  return '<span class="inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Ativo</span>';
}
function filteredComputers() {
  return state.computers.filter((computer) => {
    const status = getWarrantyStatus(computer);
    const joined = `${computer.serial} ${computer.owner} ${computer.corporateEmail || ""} ${computer.specs} ${computer.machine}`.toLowerCase();
    const matchesSearch = joined.includes(state.searchTerm.toLowerCase());
    const matchesStatus = state.statusFilter === "todos" ? true : status === state.statusFilter;
    return matchesSearch && matchesStatus;
  });
}

function renderDashboard() {
  const all = state.computers;
  const active = all.filter((item) => getWarrantyStatus(item) === "ativa").length;
  const soon = all.filter((item) => getWarrantyStatus(item) === "proxima").length;
  const expired = all.filter((item) => getWarrantyStatus(item) === "vencida").length;

  elements.metricTotal.textContent = all.length;
  elements.metricActive.textContent = active;
  elements.metricSoon.textContent = soon;
  elements.metricExpired.textContent = expired;

  const grouped = all.reduce((acc, item) => {
    const key = item.specs.trim() || "Sem especificaÃ§Ã£o";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const entries = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  if (!entries.length) {
    elements.commonSpecs.innerHTML = "<p class='text-slate-500'>Nenhuma especificaÃ§Ã£o cadastrada.</p>";
    return;
  }

  const max = entries[0][1];
  elements.commonSpecs.innerHTML = entries
    .map(([spec, count]) => {
      const pct = Math.max(8, Math.round((count / max) * 100));
      return `
        <div class="grid grid-cols-[1fr_120px_40px] items-center gap-3">
          <p class="truncate text-sm font-medium">${escapeHtml(spec)}</p>
          <div class="h-3 rounded-full bg-slate-200">
            <div class="h-3 rounded-full bg-brand-500" style="width:${pct}%"></div>
          </div>
          <p class="text-right text-sm font-semibold">${count}</p>
        </div>
      `;
    })
    .join("");
}

function renderTable() {
  const rows = filteredComputers();
  elements.tableCount.textContent = `${rows.length} computador(es) encontrado(s)`;

  if (!rows.length) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="px-4 py-8 text-center text-slate-500">Nenhum computador encontrado para os filtros atuais.</td>
      </tr>
    `;
    return;
  }

  elements.tableBody.innerHTML = rows
    .map((computer) => {
      const status = getWarrantyStatus(computer);
      const remaining = getRemainingDays(computer);
      return `
        <tr class="hover:bg-slate-50/80">
          <td class="px-4 py-4 font-semibold">${escapeHtml(computer.serial)}</td>
          <td class="px-4 py-4">${escapeHtml(computer.owner)}</td>
          <td class="px-4 py-4">${escapeHtml(computer.corporateEmail || "-")}</td>
          <td class="px-4 py-4">${escapeHtml(computer.machine || "-")}</td>
          <td class="px-4 py-4">${deviceStatusBadge(computer.deviceStatus || "ativo")}</td>
          <td class="px-4 py-4">${escapeHtml(computer.specs)}</td>
          <td class="px-4 py-4">
            <div class="space-y-1">
              ${statusBadge(status)}
              <p class="text-xs text-slate-500">${formatRemaining(remaining)}</p>
            </div>
          </td>
          <td class="px-4 py-4">
            <div class="flex justify-end gap-2">
              <button data-action="view" data-id="${computer.id}" class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100">Ver</button>
              <button data-action="edit" data-id="${computer.id}" class="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">Editar</button>
              <button data-action="delete" data-id="${computer.id}" class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100">Deletar</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

function renderCorporateEmails() {
  const rows = state.corporateEmails;
  elements.corporateEmailCount.textContent = `${rows.length} email(s) cadastrado(s)`;

  if (!rows.length) {
    elements.corporateEmailTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="px-4 py-8 text-center text-slate-500">Nenhum email corporativo cadastrado.</td>
      </tr>
    `;
    return;
  }

  elements.corporateEmailTableBody.innerHTML = rows
    .map((item) => {
      const linkedMachines = state.computers.filter((computer) => computer.corporateEmail === item.email).length;
      return `
      <tr class="hover:bg-slate-50/80">
        <td class="px-4 py-4 font-medium">${escapeHtml(item.email)}</td>
        <td class="px-4 py-4">${linkedMachines}</td>
        <td class="px-4 py-4">${formatDate(item.createdAt)}</td>
        <td class="px-4 py-4 text-right">
          <button data-email-action="delete" data-id="${item.id}" class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100">Remover</button>
        </td>
      </tr>
    `;
    })
    .join("");
}

function render() {
  elements.dashboardView.classList.toggle("hidden", state.currentView !== "dashboard");
  elements.computersView.classList.toggle("hidden", state.currentView !== "computadores");
  elements.emailsView.classList.toggle("hidden", state.currentView !== "emails");
  renderNav();
  renderDashboard();
  renderTable();
  renderCorporateEmails();
  applyAuthGate();
}

function openModal(computer = null) {
  if (!state.auth.isAuthenticated) return;
  state.editingId = computer ? computer.id : null;
  renderCorporateEmailOptions(computer?.corporateEmail || "");
  elements.modalTitle.textContent = computer ? "Editar Computador" : "Adicionar Novo Computador";
  elements.form.owner.value = computer?.owner || "";
  elements.form.serial.value = computer?.serial || "";
  elements.form.machine.value = computer?.machine || "";
  elements.form.purchaseDate.value = computer?.purchaseDate || "";
  elements.form.warrantyMonths.value = computer?.warrantyMonths ?? "";
  elements.form.cpu.value = computer?.cpu || "";
  elements.form.ram.value = computer?.ram || "";
  elements.form.gpu.value = computer?.gpu || "";
  elements.form.storage.value = computer?.storage || "";
  elements.form.storageType.value = computer?.storageType || "SSD";
  elements.form.deviceStatus.value = computer?.deviceStatus || "ativo";
  elements.form.corporateEmail.value = computer?.corporateEmail || "";
  elements.form.os.value = computer?.os || "";
  elements.form.notes.value = computer?.notes || "";
  elements.modalLayer.classList.remove("hidden");
  elements.modalLayer.classList.add("flex");
}

function closeModal() {
  state.editingId = null;
  elements.form.reset();
  elements.modalLayer.classList.add("hidden");
  elements.modalLayer.classList.remove("flex");
}

function upsertComputer(formData) {
  const payload = {
    owner: formData.get("owner").trim(),
    serial: formData.get("serial").trim(),
    machine: formData.get("machine").trim(),
    purchaseDate: String(formData.get("purchaseDate") || ""),
    warrantyMonths: Number(formData.get("warrantyMonths") || 0),
    cpu: formData.get("cpu").trim(),
    ram: formData.get("ram").trim(),
    gpu: formData.get("gpu").trim(),
    storage: formData.get("storage").trim(),
    storageType: formData.get("storageType").trim(),
    deviceStatus: String(formData.get("deviceStatus") || "ativo"),
    corporateEmail: String(formData.get("corporateEmail") || "").trim().toLowerCase(),
    os: formData.get("os").trim(),
    notes: formData.get("notes").trim()
  };
  payload.warrantyDays = payload.warrantyMonths * 30;
  payload.specs = buildSpecs(payload);

  if (state.editingId) {
    state.computers = state.computers.map((computer) =>
      computer.id === state.editingId
        ? {
            ...computer,
            ...payload
          }
        : computer
    );
  } else {
    state.computers.unshift({
      id: crypto.randomUUID(),
      ...payload,
      createdAt: new Date().toISOString()
    });
  }

  saveComputers();
  render();
}

function addCorporateEmail(emailValue) {
  const email = String(emailValue || "").trim().toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!valid) {
    throw new Error("Informe um email corporativo vÃ¡lido.");
  }
  const alreadyExists = state.corporateEmails.some((item) => item.email === email);
  if (alreadyExists) {
    throw new Error("Este email jÃ¡ foi cadastrado.");
  }

  state.corporateEmails.unshift({
    id: crypto.randomUUID(),
    email,
    createdAt: new Date().toISOString()
  });
  saveCorporateEmails();
}

function removeCorporateEmail(id) {
  const target = state.corporateEmails.find((item) => item.id === id);
  state.corporateEmails = state.corporateEmails.filter((item) => item.id !== id);
  if (target) {
    state.computers = state.computers.map((computer) =>
      computer.corporateEmail === target.email ? { ...computer, corporateEmail: "" } : computer
    );
    saveComputers();
  }
  saveCorporateEmails();
}

function viewComputer(id) {
  const computer = state.computers.find((item) => item.id === id);
  if (!computer) return;
  const remaining = getRemainingDays(computer);
  window.alert(
    `Dono: ${computer.owner}\nEmail corporativo: ${computer.corporateEmail || "-"}\nSerie: ${computer.serial}\nMaquina: ${computer.machine || "-"}\nStatus: ${statusLabel(computer.deviceStatus)}\nData de compra: ${computer.purchaseDate || "-"}\nGarantia: ${computer.warrantyMonths ?? "-"} meses\nRestante: ${formatRemaining(remaining)}\nCPU: ${computer.cpu || "-"}\nRAM: ${computer.ram || "-"}\nGPU: ${computer.gpu || "-"}\nArmazenamento: ${computer.storage || "-"} ${computer.storageType || ""}\nSO: ${computer.os || "-"}\nObservacoes: ${computer.notes || "-"}`
  );
}

function deleteComputer(id) {
  const ok = window.confirm("Deseja realmente deletar este computador?");
  if (!ok) return;
  state.computers = state.computers.filter((item) => item.id !== id);
  saveComputers();
  render();
}

function exportCsv() {
  const delimiter = ";";
  const columns = [
    { header: "Dono", key: "owner" },
    { header: "Email Corporativo", key: "corporateEmail" },
    { header: "Numero de Serie", key: "serial" },
    { header: "Maquina/Modelo", key: "machine" },
    { header: "Status", value: (c) => statusLabel(c.deviceStatus) },
    { header: "Data de Compra", value: (c) => (c.purchaseDate ? formatDate(c.purchaseDate) : "") },
    { header: "Garantia (meses)", key: "warrantyMonths" },
    { header: "Processador (CPU)", key: "cpu" },
    { header: "Memoria (RAM)", key: "ram" },
    { header: "Placa de Video (GPU)", key: "gpu" },
    { header: "Armazenamento", key: "storage" },
    { header: "Tipo de Armazenamento", key: "storageType" },
    { header: "Sistema Operacional", key: "os" },
    { header: "Observacoes", key: "notes" },
    { header: "Garantia (dias)", key: "warrantyDays" },
    { header: "Resumo Specs", key: "specs" },
    { header: "Cadastro", value: (c) => (c.createdAt ? new Date(c.createdAt).toLocaleString("pt-BR") : "") }
  ];

  const toCsvCell = (value) => `"${String(value ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
  const headerLine = columns.map((col) => toCsvCell(col.header)).join(delimiter);
  const rows = state.computers.map((computer) =>
    columns
      .map((col) => {
        const raw = typeof col.value === "function" ? col.value(computer) : computer[col.key];
        return toCsvCell(raw);
      })
      .join(delimiter)
  );

  const csv = ["sep=;", headerLine, ...rows].join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "inventario-computadores.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function importCsv(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const text = String(event.target?.result || "");
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      window.alert("CSV sem dados validos.");
      return;
    }

    const startIndex = lines[0].toLowerCase().startsWith("sep=") ? 1 : 0;
    const delimiter = lines[startIndex].includes(";") ? ";" : ",";
    const rawHeaders = parseCsvLine(lines[startIndex], delimiter).map((h) => h.replace(/(^"|"$)/g, "").trim());
    const normalizeHeader = (header) => {
      const key = header
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w]/g, "")
        .toLowerCase();
      const map = {
        dono: "owner",
        owner: "owner",
        emailcorporativo: "corporateEmail",
        corporateemail: "corporateEmail",
        numerodeserie: "serial",
        serial: "serial",
        maquinamodelo: "machine",
        machine: "machine",
        status: "deviceStatus",
        devicestatus: "deviceStatus",
        datadecompra: "purchaseDate",
        purchasedate: "purchaseDate",
        garantiameses: "warrantyMonths",
        warrantymonths: "warrantyMonths",
        processadorcpu: "cpu",
        cpu: "cpu",
        memoriaram: "ram",
        ram: "ram",
        placadevideogpu: "gpu",
        gpu: "gpu",
        armazenamento: "storage",
        storagetype: "storageType",
        tipodearmazenamento: "storageType",
        sistemaoperacional: "os",
        os: "os",
        observacoes: "notes",
        notes: "notes",
        garantiadias: "warrantyDays",
        warrantydays: "warrantyDays",
        resumospecs: "specs",
        specs: "specs",
        cadastro: "createdAt",
        createdat: "createdAt"
      };
      return map[key] || header;
    };
    const headers = rawHeaders.map(normalizeHeader);
    const required = ["owner", "serial"];
    const missing = required.filter((key) => !headers.includes(key));
    if (missing.length) {
      window.alert(`CSV invalido. Campos obrigatorios ausentes: ${missing.join(", ")}`);
      return;
    }

    const imported = lines
      .slice(startIndex + 1)
      .map((line) => {
        const values = parseCsvLine(line, delimiter);
        const row = Object.fromEntries(headers.map((key, idx) => [key, values[idx] || ""]));
        const normalized = {
          id: crypto.randomUUID(),
          owner: row.owner.trim(),
          corporateEmail: row.corporateEmail?.trim().toLowerCase() || "",
          serial: row.serial.trim(),
          machine: row.machine?.trim() || "",
          deviceStatus: ["ativo", "inativo", "pendente"].includes((row.deviceStatus || "").toLowerCase())
            ? row.deviceStatus.toLowerCase()
            : "ativo",
          purchaseDate: row.purchaseDate || "",
          warrantyMonths: Number(row.warrantyMonths || 0),
          cpu: row.cpu?.trim() || "",
          ram: row.ram?.trim() || "",
          gpu: row.gpu?.trim() || "",
          storage: row.storage?.trim() || "",
          storageType: row.storageType?.trim() || "SSD",
          os: row.os?.trim() || "",
          notes: row.notes?.trim() || "",
          warrantyDays: Number(row.warrantyDays || Number(row.warrantyMonths || 0) * 30 || 0),
          specs: row.specs?.trim() || "",
          createdAt: row.createdAt || new Date().toISOString()
        };
        normalized.specs = normalized.specs || buildSpecs(normalized);
        return normalized;
      })
      .filter((item) => item.owner && item.serial);

    if (!imported.length) {
      window.alert("Nenhuma linha valida encontrada para importar.");
      return;
    }

    state.computers = [...imported, ...state.computers];
    saveComputers();
    render();
    window.alert(`${imported.length} computador(es) importado(s) com sucesso.`);
  };
  reader.readAsText(file, "utf-8");
}

function parseCsvLine(line, delimiter = ",") {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readMockUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || "[]");
    return Array.isArray(users) ? users : [];
  } catch (error) {
    return [];
  }
}

function writeMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function buildMockToken(email) {
  const safeEmail = btoa(unescape(encodeURIComponent(email)));
  return `mock.${safeEmail}.${Date.now()}`;
}

function decodeMockToken(token) {
  const parts = String(token || "").split(".");
  if (parts.length < 3 || parts[0] !== "mock") return null;
  try {
    return decodeURIComponent(escape(atob(parts[1])));
  } catch (error) {
    return null;
  }
}

const mockAuthService = {
  async login(payload) {
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    const users = readMockUsers();
    const found = users.find((user) => user.email === email && user.password === password);
    if (!found) {
      throw new Error("Credenciais invÃ¡lidas.");
    }
    return { token: buildMockToken(email), user: { email } };
  },
  async register(payload) {
    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || "");
    const users = readMockUsers();
    const exists = users.some((user) => user.email === email);
    if (exists) {
      throw new Error("Email jÃ¡ cadastrado.");
    }
    users.push({ email, password });
    writeMockUsers(users);
    return { token: buildMockToken(email), user: { email } };
  },
  async me(token) {
    const email = decodeMockToken(token);
    if (!email) {
      throw new Error("SessÃ£o invÃ¡lida.");
    }
    return { user: { email } };
  },
  async logout() {
    return true;
  }
};

async function apiRequest({ path, method = "GET", body, token }) {
  try {
    const response = await fetch(`${AUTH_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const raw = await response.text();
    let data = {};
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (error) {
        data = {};
      }
    }

    if (response.ok) {
      return { ok: true, data };
    }

    return {
      ok: false,
      status: response.status,
      message: data.message || `Falha na autenticaÃ§Ã£o (${response.status}).`
    };
  } catch (error) {
    return { ok: false, networkError: true, message: "NÃ£o foi possÃ­vel conectar com a API de autenticaÃ§Ã£o." };
  }
}

function canUseMockFallback(result) {
  if (!AUTH_USE_MOCK) return false;
  if (result.networkError) return true;
  return result.status === 404 || result.status === 405 || result.status >= 500;
}

const authService = {
  async login(payload) {
    const apiResult = await apiRequest({ path: "/login", method: "POST", body: payload });
    if (apiResult.ok) return normalizeAuthPayload(apiResult.data);
    if (canUseMockFallback(apiResult)) return mockAuthService.login(payload);
    throw new Error(apiResult.message || "Falha ao autenticar.");
  },
  async register(payload) {
    const apiResult = await apiRequest({ path: "/register", method: "POST", body: payload });
    if (apiResult.ok) return normalizeAuthPayload(apiResult.data);
    if (canUseMockFallback(apiResult)) return mockAuthService.register(payload);
    throw new Error(apiResult.message || "Falha ao cadastrar.");
  },
  async me(token) {
    const apiResult = await apiRequest({ path: "/me", method: "GET", token });
    if (apiResult.ok) return normalizeMePayload(apiResult.data);
    if (canUseMockFallback(apiResult)) return mockAuthService.me(token);
    throw new Error(apiResult.message || "SessÃ£o invÃ¡lida.");
  },
  async logout() {
    await mockAuthService.logout();
  }
};

function normalizeAuthPayload(data) {
  if (!data || typeof data.token !== "string" || !data.user || typeof data.user.email !== "string") {
    throw new Error("Resposta invÃ¡lida da autenticaÃ§Ã£o.");
  }
  return {
    token: data.token,
    user: { email: data.user.email }
  };
}

function normalizeMePayload(data) {
  if (!data || !data.user || typeof data.user.email !== "string") {
    throw new Error("SessÃ£o invÃ¡lida.");
  }
  return { user: { email: data.user.email } };
}

async function validateExistingSession() {
  if (!state.auth.token) {
    state.auth.isAuthenticated = false;
    return;
  }
  try {
    setAuthLoading(true);
    const result = await authService.me(state.auth.token);
    state.auth.user = result.user;
    state.auth.isAuthenticated = true;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user));
  } catch (error) {
    clearAuthSession();
    setAuthMode("login");
  } finally {
    setAuthLoading(false);
  }
}

async function submitAuth(mode, formElement) {
  const formData = new FormData(formElement);
  const payload = {
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || "")
  };

  setAuthError("");
  setAuthLoading(true);
  try {
    let result;
    if (mode === "login") {
      result = await authService.login(payload);
    } else {
      result = await authService.register(payload);
    }
    persistAuthSession(result);
    formElement.reset();
    render();
  } catch (error) {
    setAuthError(error.message || "Falha na autenticaÃ§Ã£o.");
  } finally {
    setAuthLoading(false);
    render();
  }
}

async function logout() {
  await authService.logout();
  clearAuthSession();
  closeModal();
  setAuthMode("login");
  setAuthError("");
  render();
}

function bindEvents() {
  elements.navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!state.auth.isAuthenticated) return;
      state.currentView = button.dataset.nav;
      setCorporateFeedback("");
      render();
    });
  });

  document.getElementById("go-computers").addEventListener("click", () => {
    if (!state.auth.isAuthenticated) return;
    state.currentView = "computadores";
    render();
  });

  document.querySelectorAll("#new-from-dashboard, #new-from-table, #floating-add").forEach((button) => {
    button.addEventListener("click", () => openModal());
  });

  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("cancel-modal").addEventListener("click", closeModal);
  elements.modalLayer.addEventListener("click", (event) => {
    if (event.target === elements.modalLayer) closeModal();
  });

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.auth.isAuthenticated) return;
    const data = new FormData(elements.form);
    upsertComputer(data);
    closeModal();
  });

  elements.filterSearch.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;
    renderTable();
  });

  elements.filterStatus.addEventListener("change", (event) => {
    state.statusFilter = event.target.value;
    renderTable();
  });

  elements.corporateEmailForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.auth.isAuthenticated) return;
    try {
      addCorporateEmail(elements.corporateEmailInput.value);
      elements.corporateEmailForm.reset();
      setCorporateFeedback("Email corporativo adicionado com sucesso.");
      render();
    } catch (error) {
      setCorporateFeedback(error.message || "Falha ao adicionar email.", "error");
    }
  });

  elements.corporateEmailTableBody.addEventListener("click", (event) => {
    if (!state.auth.isAuthenticated) return;
    const button = event.target.closest("button[data-email-action='delete']");
    if (!button) return;
    removeCorporateEmail(button.dataset.id);
    setCorporateFeedback("Email corporativo removido.");
    render();
  });

  elements.tableBody.addEventListener("click", (event) => {
    if (!state.auth.isAuthenticated) return;
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const { action, id } = button.dataset;
    if (action === "view") viewComputer(id);
    if (action === "edit") {
      const computer = state.computers.find((item) => item.id === id);
      if (computer) openModal(computer);
    }
    if (action === "delete") deleteComputer(id);
  });

  document.getElementById("export-csv").addEventListener("click", () => {
    if (!state.auth.isAuthenticated) return;
    exportCsv();
  });
  document.getElementById("export-pdf").addEventListener("click", () => {
    if (!state.auth.isAuthenticated) return;
    window.print();
  });
  elements.importInput.addEventListener("change", (event) => {
    if (!state.auth.isAuthenticated) return;
    const file = event.target.files?.[0];
    if (!file) return;
    importCsv(file);
    event.target.value = "";
  });

  elements.authTabLogin.addEventListener("click", () => setAuthMode("login"));
  elements.authTabRegister.addEventListener("click", () => setAuthMode("register"));

  elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitAuth("login", elements.loginForm);
  });

  elements.registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitAuth("register", elements.registerForm);
  });

  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.logoutButton.addEventListener("click", logout);
}

async function bootstrap() {
  applyTheme();
  bindEvents();
  setAuthMode("login");
  await validateExistingSession();
  render();
}

bootstrap();




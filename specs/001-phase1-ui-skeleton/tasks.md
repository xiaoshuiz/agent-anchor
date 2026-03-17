# Tasks: Phase 1 - 基础框架与 UI 骨架

**Input**: Design documents from `specs/001-phase1-ui-skeleton/`  
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/ipc.md

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story (US1–US9)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure project structure and dependencies per plan

- [ ] T001 Verify/create electron/ structure: main.ts, preload.ts, db.ts, ipc-handlers.ts
- [ ] T002 Verify/create src/components/ structure: Sidebar/, Channel/, ErrorBoundary/
- [ ] T003 [P] Add electron-store to package.json for sidebar collapse persistence
- [ ] T004 [P] Add react-error-boundary or create ErrorBoundary component dependency

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: SQLite + IPC must be complete before US2, US3

- [ ] T005 Implement electron/db.ts: better-sqlite3 init, schema from data-model.md, migrations
- [ ] T006 Implement electron/db.ts: channels.list, agents.list, messages.listByChannel
- [ ] T007 Implement electron/ipc-handlers.ts: register IPC handlers for channels, agents, messages
- [ ] T008 Update electron/preload.ts: expose channels.list, agents.list, messages.list via contextBridge
- [ ] T009 Update electron/main.ts: init DB on app ready, register IPC handlers
- [ ] T010 Add first-run logic: seed #general channel if DB empty (in electron/db.ts)

**Checkpoint**: DB + IPC ready; UI can fetch real data

---

## Phase 3: User Story 1 - 三栏布局 (Priority: P1) 🎯 MVP

**Goal**: Slack-style three-panel layout visible on app launch

**Independent Test**: `pnpm run dev` → see Sidebar | Channel | (Thread placeholder)

- [ ] T011 [P] [US1] Create src/components/Sidebar/Sidebar.tsx with Channels/Agents section headers
- [ ] T012 [P] [US1] Create src/components/Channel/ChannelHeader.tsx
- [ ] T013 [P] [US1] Create src/components/Channel/MessageList.tsx (placeholder)
- [ ] T014 [P] [US1] Create src/components/Channel/MessageInput.tsx (placeholder)
- [ ] T015 [US1] Refactor src/App.tsx: three-column layout (Sidebar | Main | Right placeholder)
- [ ] T016 [US1] Add CollapseButton placeholder in src/components/Sidebar/CollapseButton.tsx

**Checkpoint**: US1 complete – three-panel layout visible

---

## Phase 4: User Story 2 - 侧边栏真实数据 (Priority: P1)

**Goal**: Sidebar shows channels and agents from SQLite; empty state or #general

**Independent Test**: Launch app → sidebar shows #general or empty state

- [ ] T017 [US2] Create src/hooks/useChannels.ts: invoke IPC channels.list
- [ ] T018 [US2] Create src/hooks/useAgents.ts: invoke IPC agents.list
- [ ] T019 [US2] Create src/components/Sidebar/ChannelList.tsx: render channels from useChannels
- [ ] T020 [US2] Create src/components/Sidebar/AgentList.tsx: render agents from useAgents
- [ ] T021 [US2] Integrate ChannelList and AgentList into Sidebar.tsx
- [ ] T022 [US2] Add selected channel state to src/stores/uiStore.ts
- [ ] T023 [US2] Wire channel click → update selectedChannel in uiStore

**Checkpoint**: US2 complete – sidebar shows real data or empty state

---

## Phase 5: User Story 3 - 主区域消息列表 (Priority: P1)

**Goal**: Main area shows messages from SQLite; Slack-like bubbles; empty state illustration

**Independent Test**: Select channel → see messages or empty state illustration

- [ ] T024 [US3] Create src/hooks/useMessages.ts: invoke IPC messages.list(channelId)
- [ ] T025 [US3] Create src/components/Channel/MessageBubble.tsx: user right, agent left, timestamp
- [ ] T026 [US3] Update MessageList.tsx: render messages from useMessages, use MessageBubble
- [ ] T027 [US3] Create src/components/Channel/EmptyState.tsx with illustration (empty-state.svg)
- [ ] T028 [US3] Add EmptyState to MessageList when no messages
- [ ] T029 [US3] Create src/assets/illustrations/empty-state.svg (anchor-themed illustration)
- [ ] T030 [US3] Wire ChannelHeader to show selected channel name from uiStore

**Checkpoint**: US3 complete – messages or empty state visible

---

## Phase 6: User Story 4 - 输入框 (Priority: P2)

**Goal**: Input box focusable, accepts text; Enter/send does nothing (no persist)

**Independent Test**: Click input, type text, no error

- [ ] T031 [US4] Implement MessageInput.tsx: controlled input, placeholder "Type a message..."
- [ ] T032 [US4] Handle Enter key: prevent default, no-op (Phase 1)
- [ ] T033 [US4] Add send button (optional): no-op on click

**Checkpoint**: US4 complete – input works

---

## Phase 7: User Story 5 - 跟随系统主题 (Priority: P2)

**Goal**: App theme follows prefers-color-scheme

**Independent Test**: Toggle system dark/light → app theme updates

- [ ] T034 [P] [US5] Add darkMode: 'class' to tailwind.config.js
- [ ] T035 [US5] Create src/stores/themeStore.ts: listen prefers-color-scheme, sync to 'dark' class on html
- [ ] T036 [US5] Apply theme in App.tsx or root: themeStore controls add/remove 'dark' class on document.documentElement
- [ ] T037 [US5] Ensure all components use Tailwind dark: variants

**Checkpoint**: US5 complete – theme follows system

---

## Phase 8: User Story 6 - 侧边栏折叠 (Priority: P2)

**Goal**: Sidebar collapses to icon bar (~48–64px); dedicated button; state persisted

**Independent Test**: Click collapse → narrow; click expand → full; restart → state kept

- [ ] T038 [US6] Implement CollapseButton.tsx: toggle icon, onClick handler
- [ ] T039 [US6] Add sidebarCollapsed to uiStore (Zustand)
- [ ] T040 [US6] Persist sidebarCollapsed via electron-store (main process or renderer)
- [ ] T041 [US6] Update Sidebar.tsx: conditional width (expanded ~240px, collapsed ~56px)
- [ ] T042 [US6] Load persisted collapse state on app init

**Checkpoint**: US6 complete – collapse works, state persisted

---

## Phase 9: User Story 7 - Anchor 图标 (Priority: P2)

**Goal**: Anchor-themed icon; applied to window, Dock, build output

**Independent Test**: Window/Dock shows icon; built .app has icon

- [ ] T043 [P] [US7] Create src/assets/icons/anchor.svg (anchor symbol)
- [ ] T044 [US7] Generate resources/icon.icns from anchor.svg using electron-icon-builder or similar npm package
- [ ] T045 [US7] Configure electron/main.ts: set icon for BrowserWindow
- [ ] T046 [US7] Configure package.json build: mac icon path for electron-builder

**Checkpoint**: US7 complete – icon visible

---

## Phase 10: User Story 8 - 空状态与 Error Boundary (Priority: P2)

**Goal**: Empty state illustrations; global Error Boundary with fallback

**Independent Test**: Empty data → illustration; throw in component → fallback, no white screen

- [ ] T047 [US8] Add EmptyState for no channels in Sidebar (reuse or variant)
- [ ] T048 [US8] Add EmptyState for no agents in Sidebar
- [ ] T049 [US8] Create src/components/ErrorBoundary/ErrorFallback.tsx: message, retry button
- [ ] T050 [US8] Wrap App in ErrorBoundary (react-error-boundary or custom) in src/main.tsx
- [ ] T051 [US8] Ensure ErrorFallback has Slack-like styling (dark/light)

**Checkpoint**: US8 complete – empty states + Error Boundary

---

## Phase 11: User Story 9 - GitHub CI/CD (Priority: P1)

**Goal**: Merge to main → build macOS app → create Release with artifact

**Independent Test**: Merge PR → Actions run → Release created with .dmg or .zip

- [ ] T052 [US9] Create .github/workflows/release.yml: trigger on push to main
- [ ] T053 [US9] Configure workflow: checkout, pnpm install, pnpm run build
- [ ] T054 [US9] Add electron-builder step: build for mac
- [ ] T055 [US9] Add release step: create GitHub Release, upload build artifact
- [ ] T056 [US9] Ensure package.json has electron-builder mac config (icon, target)

**Checkpoint**: US9 complete – CI/CD works

---

## Phase 12: Polish & Cross-Cutting

**Purpose**: Final integration and validation

- [ ] T057 Run quickstart.md validation: pnpm install, pnpm run dev, pnpm run build; verify SC-001 (layout visible within 3s), SC-002 (100 messages scroll smoothly)
- [ ] T058 Verify all checklists in specs/001-phase1-ui-skeleton/checklists/ (requirements, ux)
- [ ] T059 Code cleanup: remove unused imports, ensure TypeScript strict passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1 – BLOCKS US2, US3
- **Phase 3 (US1)**: Depends on Phase 1 – layout only
- **Phase 4 (US2)**: Depends on Phase 2, 3
- **Phase 5 (US3)**: Depends on Phase 2, 3, 4 (selected channel)
- **Phase 6–11**: Can proceed after Phase 5; US4–US8 largely independent
- **Phase 12**: After all user stories

### User Story Dependencies

- **US1**: Independent (layout)
- **US2**: Needs Phase 2 (DB, IPC)
- **US3**: Needs Phase 2, US2 (channel selection)
- **US4**: Needs US1
- **US5**: Independent
- **US6**: Needs US1
- **US7**: Independent
- **US8**: Needs US2, US3 (empty states)
- **US9**: Independent (CI)

### Parallel Opportunities

- T003, T004 (Setup)
- T011–T016 within US1 (different components)
- T034 (US5) with T043 (US7)
- T047, T048 (US8) can be [P]

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
2. **STOP**: Validate three-panel layout + real data + messages/empty state
3. Then add US4, US5, US6, US7, US8, US9

### Suggested Order

1. T001–T010 (Setup + Foundational)
2. T011–T016 (US1)
3. T017–T023 (US2)
4. T024–T030 (US3)
5. T031–T033 (US4)
6. T034–T037 (US5)
7. T038–T042 (US6)
8. T043–T046 (US7)
9. T047–T051 (US8)
10. T052–T056 (US9)
11. T057–T059 (Polish)

---

## Notes

- [P] = parallelizable
- Each user story independently testable
- Commit after each task or logical group
- Total: 59 tasks

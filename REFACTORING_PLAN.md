# TickUp MobX Refactoring Plan

## Current Status: 8/100 Components Complete (8%)

### ✅ Completed (8 components):
1. DashboardPage ✓
2. FormsPage ✓
3. LoginPage ✓
4. TeamPage ✓
5. AuditDashboard ✓
6. Header ✓
7. MainLayout ✓
8. ModerationDashboard ✓

### 🚧 In Progress (0 components):
None

### ⏳ Remaining (92 components):

#### Priority 1: Critical Pages (11 components)
These are the most-used pages and should be refactored first:

1. **KanbanPage** (569 lines) - Highest priority, main project board
2. **DocumentsPage** (155 lines) - Document management
3. **LearningPage** (295 lines) - Learning assignments
4. **FeedbackPage** (309 lines) - Feedback system
5. **AnjamPage** (270 lines) - Daily tasks
6. **ReportsPage** (959 lines) - Analytics and reports
7. **AdminPage** (872 lines) - User administration
8. **StrategyPage** (1003 lines) - Strategic planning
9. **ConsultingPage** (131 lines) - Consulting features
10. **InsightsPage** (149 lines) - Business insights
11. **Sidebar** - Navigation component

**Estimated Time:** 40-50 hours

#### Priority 2: Modal Components (15 components)
1. AddTaskModal
2. EditTaskModal
3. AddProjectModal
4. EditProjectModal
5. NewTeamModal
6. EditObjectiveModal
7. NewObjectiveForm
8. NewKeyResultForm
9. ObjectiveCreationWizard
10. SmartObjectiveWizard
11. LearningResourceSelectorModal
12. FormBuilderModal2
13. IkigaiWizard
14. SlashCommandMenu
15. MoreActionsMenu

**Estimated Time:** 20-25 hours

#### Priority 3: Display Components (30 components)
1. ObjectiveRow
2. KeyResultRow
3. TaskCard
4. FormCard
5. ObjectiveDisplay
6. ObjectiveSidePanel
7. KeyResultSidePanel
8. TaskSidePanel
9. MemberProfileSidePanel
10. FeedbackSidePanel
11. ProcessStepSidePanel
12. HierarchicalView
13. TableView
14. CalendarView
15. TimelineView
16. CardView
17. ProcessView
18. ListView
19. FormDisplay
20. FormFieldRenderer
21. DocumentEditor
22. DocumentToolbar
23. DailyTargetCard
24. DailyTargetTaskCard
25. DailySuccessRing
26. ObjectiveCard
27. ObjectiveSelectors
28. ProgressChart
29. ProgressBar
30. EditableBlock

**Estimated Time:** 40-50 hours

#### Priority 4: Utility Components (16 components)
1. EditableCell
2. DatePicker
3. DueDateSelector
4. Checklist
5. Comments
6. CreateMenu
7. AICreateMenu
8. AIChatButton
9. AIChatPanel
10. AIDisplayPanel
11. ConsultantPopover
12. ReadConfirmation
13. StarRating
14. BottomNavBar
15. UserProfile
16. TableToolbar

**Estimated Time:** 15-20 hours

#### Priority 5: Simple Components (20 components)
Already stateless, minimal/no work needed:
- ContractsPage, CrmPage, CustomersPage, ExpensesPage, etc.

**Estimated Time:** 2-5 hours

## Refactoring Checklist (Per Component)

### Step 1: Component Conversion
- [ ] Remove interface with Props
- [ ] Import `observer` from `mobx-react-lite`
- [ ] Import `useStore` from `stores/StoreContext`
- [ ] Import relevant emitters from `emitter.ts`
- [ ] Change signature: `const Component: React.FC = observer(() => {`
- [ ] Add `const { store1, store2 } = useStore();`
- [ ] Replace all prop references with store access
- [ ] Add closing `});` and keep `export default`

### Step 2: Handler Conversion
- [ ] Replace callback props with emitter functions
- [ ] Make handlers async if using emitters
- [ ] Add error handling for socket failures
- [ ] Remove prop passing to child components

### Step 3: Testing
- [ ] Verify component renders
- [ ] Test socket reactivity (open 2 browser windows)
- [ ] Verify CRUD operations sync across windows
- [ ] Check for console errors
- [ ] Verify build passes

### Step 4: Router Update
- [ ] Remove props from Router.tsx for this component
- [ ] Change to: `<Component />`
- [ ] Test navigation works

## Code Pattern

### Before (Prop-Based):
```typescript
interface MyPageProps {
  data: Data[];
  onAction: (id: string) => void;
  users: User[];
}

const MyPage: React.FC<MyPageProps> = ({ data, onAction, users }) => {
  return (
    <div>
      {data.map(item => (
        <ItemCard key={item.id} item={item} onAction={onAction} />
      ))}
    </div>
  );
};

export default MyPage;
```

### After (MobX):
```typescript
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreContext';
import { emitAction } from '../emitter';

const MyPage: React.FC = observer(() => {
  const { dataStore, userStore } = useStore();
  const data = dataStore.items;
  const users = userStore.users;
  
  const handleAction = async (id: string) => {
    await emitAction(id);
  };
  
  return (
    <div>
      {data.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
});

export default MyPage;
```

## Weekly Milestones

### Week 1 (40 hours)
- Refactor Priority 1 pages (11 components)
- Update Router.tsx for these pages
- Test socket synchronization

### Week 2 (40 hours)
- Refactor Priority 2 modals (15 components)
- Refactor 10 Priority 3 components
- Update Router.tsx

### Week 3 (40 hours)
- Complete Priority 3 components (20 remaining)
- Update Router.tsx
- Test all refactored components

### Week 4 (40 hours)
- Complete Priority 4 components (16)
- Complete Priority 5 components (20)
- Final Router.tsx cleanup
- Comprehensive testing
- Documentation

**Total Estimated Time:** 160 hours (4 weeks @ 40 hours/week)

## Success Metrics

- [ ] 0 components using prop drilling
- [ ] 100 components using observer() pattern
- [ ] Router.tsx has no prop passing
- [ ] All socket events trigger UI updates
- [ ] Two-window sync test passes for all features
- [ ] Build succeeds with 0 errors
- [ ] No console errors in production

## Risk Mitigation

1. **Test frequently** - Run build after every 2-3 components
2. **Commit often** - Commit after each component or small batch
3. **Keep old code** - Don't delete old files immediately
4. **Document issues** - Note any edge cases or problems
5. **Pair review** - Have someone check critical pages

## Current Blocker

**Router.tsx prop passing must be removed incrementally** as components are refactored. This is the main source of broken reactivity.

## Notes

- Build currently passes ✅
- No security vulnerabilities ✅
- Socket infrastructure is solid ✅
- Store architecture is well-designed ✅
- Pattern is established and proven ✅

**The foundation is ready - just need to complete the migration!**

import { GuildState, Quest, QuestStatus } from '../../types';

interface QuestDeps {
  activeGuild: GuildState;
  triggerSave: (state: GuildState) => void;
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const useQuestActions = ({ activeGuild, triggerSave, notify }: QuestDeps) => {
  const addQuest = (quest: Omit<Quest, 'id'>) => {
    triggerSave({
      ...activeGuild,
      quests: [...(activeGuild.quests || []), { ...quest, id: crypto.randomUUID(), status: 'Disponivel' }]
    });
    notify("Missão publicada.");
  };

  const updateQuest = (id: string, data: Partial<Quest>) => {
    triggerSave({
      ...activeGuild,
      quests: (activeGuild.quests || []).map(q => q.id === id ? { ...q, ...data } : q)
    });
    notify("Missão atualizada.");
  };

  const updateQuestStatus = (id: string, status: QuestStatus) => {
    triggerSave({
      ...activeGuild,
      quests: (activeGuild.quests || []).map(q => q.id === id ? { ...q, status } : q)
    });
  };

  const deleteQuest = (id: string) => {
    triggerSave({
      ...activeGuild,
      quests: (activeGuild.quests || []).filter(q => q.id !== id)
    });
    notify("Missão removida.");
  };

  return { addQuest, updateQuest, updateQuestStatus, deleteQuest };
};

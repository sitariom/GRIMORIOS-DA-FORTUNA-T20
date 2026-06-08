import { GuildState, PointOfInterest, ReputationEntry } from '../../types';

interface ReputationDeps {
  activeGuild: GuildState;
  triggerSave: (state: GuildState) => void;
  notify: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const useReputationActions = ({ activeGuild, triggerSave, notify }: ReputationDeps) => {
  const addPointOfInterest = (poi: Omit<PointOfInterest, 'id'>) => {
    triggerSave({
      ...activeGuild,
      pointsOfInterest: [...(activeGuild.pointsOfInterest || []), { ...poi, id: crypto.randomUUID() }]
    });
    notify("Ponto de interesse registrado.");
  };

  const updatePointOfInterest = (id: string, data: Partial<PointOfInterest>) => {
    triggerSave({
      ...activeGuild,
      pointsOfInterest: (activeGuild.pointsOfInterest || []).map(p => p.id === id ? { ...p, ...data } : p)
    });
    notify("Ponto de interesse atualizado.");
  };

  const removePointOfInterest = (id: string) => {
    triggerSave({
      ...activeGuild,
      pointsOfInterest: (activeGuild.pointsOfInterest || []).filter(p => p.id !== id),
      reputations: (activeGuild.reputations || []).filter(r => r.pointOfInterestId !== id)
    });
    notify("Ponto de interesse removido.");
  };

  const addReputation = (rep: Omit<ReputationEntry, 'id'>) => {
    triggerSave({
      ...activeGuild,
      reputations: [...(activeGuild.reputations || []), { ...rep, id: crypto.randomUUID() }]
    });
    notify("Registro de reputação criado.");
  };

  const updateReputation = (id: string, data: Partial<ReputationEntry>) => {
    triggerSave({
      ...activeGuild,
      reputations: (activeGuild.reputations || []).map(r => r.id === id ? { ...r, ...data } : r)
    });
  };

  const removeReputation = (id: string) => {
    triggerSave({
      ...activeGuild,
      reputations: (activeGuild.reputations || []).filter(r => r.id !== id)
    });
    notify("Registro de reputação removido.");
  };

  return {
    addPointOfInterest, updatePointOfInterest, removePointOfInterest,
    addReputation, updateReputation, removeReputation
  };
};

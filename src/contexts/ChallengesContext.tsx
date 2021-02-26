import Cookies from "js-cookie";
import { createContext, ReactNode, useEffect, useState } from "react";
import challenges from '../../challenges.json';
import { LevelUpModal } from "../components/LevelUpModal";

interface Challenge {
    type: 'body' | 'eye';
    description: string;
    amount: number;
}

interface ChallengesContextData {
    level: number;
    currentExperience: number;
    challengesCompleted: number;
    experienceToNextLevel: number;
    activeChallenge: Challenge;
    levelUp: () => void;
    startNewChallenge: () => void;
    resetChallenge: () => void,
    completedChallenge: () => void,
    closeLevelUp: () => void,
}

interface ChallengesProviderProps {
    children: ReactNode;
    level: Number;
    currentExperience: Number;
    challengesCompleted: Number;
}

export const ChallengesContext = createContext({} as ChallengesContextData);

export function ChallengesProvider({ children, ...rest }: ChallengesProviderProps) {
  const [level, setLevel] = useState(rest.level ?? 1);
  const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0);
  const [challengesCompleted, setChallengesCompleted] = useState(rest.challengesCompleted ?? 0);

  const [activeChallenge, setActiveChallenge] = useState(null);
  const [levelUpMoralOpen, setLevelUpMoralOpen] = useState(false);

  const experienceToNextLevel = Math.pow((level + 1)*4 ,2);

  useEffect(() => {
    Notification.requestPermission()
  }, [])

  useEffect(() => {
    Cookies.set('level', String(level));
    Cookies.set('currentExperience', String(currentExperience));
    Cookies.set('challengesCompleted', String(challengesCompleted));
  }, [level, currentExperience, challengesCompleted])

  function levelUp() {
    setLevel(level + 1);
    setLevelUpMoralOpen(true);
  }

  function closeLevelUp() {
    setLevelUpMoralOpen(false)
  }

  function startNewChallenge() {
    const randomChallengeIndex = Math.floor(Math.random() * challenges.length);
    const challenge = challenges[randomChallengeIndex];

    setActiveChallenge(challenge);

    new Audio('/notification.mp3').play();

    if (Notification.permission === 'granted') {
      new Notification('Novo desafio !!', {
        body: `Valendo ${challenge.amount} xp`
      })
    }
  }

  function resetChallenge() {
      setActiveChallenge(null);
  }

  function completedChallenge() {
    if(!activeChallenge) return;

    const { amount } = activeChallenge;

    let finalExperience = currentExperience + amount;

    if (finalExperience >= experienceToNextLevel) {
      levelUp();
      finalExperience -= experienceToNextLevel;
    }

    setCurrentExperience(finalExperience);
    setActiveChallenge(null);
    setChallengesCompleted(challengesCompleted + 1);
  }

  return (
    <ChallengesContext.Provider
      value={{
        level,
        currentExperience,
        challengesCompleted,
        activeChallenge,
        experienceToNextLevel,
        startNewChallenge,
        levelUp,
        resetChallenge,
        completedChallenge,
        closeLevelUp,
      }}
    >
      {children}

      {levelUpMoralOpen && <LevelUpModal />}
    </ChallengesContext.Provider>
  );
}

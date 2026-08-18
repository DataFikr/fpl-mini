import React from 'react';
import { Composition, Still } from 'remotion';
import { FR08Fatigue, fr08Schema, fr08Duration } from './compositions/FR08Fatigue';
import { FR08Cover } from './compositions/FR08Cover';
import { FR01Headlines, fr01Schema, fr01Duration } from './compositions/FR01Headlines';
import { FR01Cover } from './compositions/FR01Cover';
import { FR07Predictions, fr07Schema, fr07Duration } from './compositions/FR07Predictions';
import { FR07Cover } from './compositions/FR07Cover';
import { FR02RankRace, fr02Schema, fr02Duration } from './compositions/FR02RankRace';
import { FR02Cover } from './compositions/FR02Cover';
import { FR03MonthlyReset, fr03Schema, fr03Duration } from './compositions/FR03MonthlyReset';
import { FR03Cover } from './compositions/FR03Cover';
import { FR10Onboarding, fr10Schema, fr10Duration } from './compositions/FR10Onboarding';
import { FR10Cover } from './compositions/FR10Cover';
import { FR09Differentials, fr09Schema, fr09Duration } from './compositions/FR09Differentials';
import { FR09Cover } from './compositions/FR09Cover';
import { FR05RivalWatch, fr05Schema, fr05Duration } from './compositions/FR05RivalWatch';
import { FR05Cover } from './compositions/FR05Cover';
import { FR06TransferImpact, fr06Schema, fr06Duration } from './compositions/FR06TransferImpact';
import { FR06Cover } from './compositions/FR06Cover';
import { FR16TwoTables, fr16Schema, fr16Duration } from './compositions/FR16TwoTables';
import { FR16Cover } from './compositions/FR16Cover';
import { FR17ValueDensity, fr17Schema, fr17Duration } from './compositions/FR17ValueDensity';
import { FR17Cover } from './compositions/FR17Cover';
import { V } from './theme';
import { DEFAULT_MUSIC } from './audio';

/**
 * Every FR-xx brief in .claude/skills/fpl-content/references/video-briefs.md
 * registers here. The master is the TikTok/Reels cut; `shorts` is the tighter
 * YouTube Shorts cut; `loop` is the silent 10s outreach clip.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="FR08Fatigue"
      component={FR08Fatigue}
      schema={fr08Schema}
      defaultProps={{ variant: 'master' as const, music: DEFAULT_MUSIC }}
      width={V.width}
      height={V.height}
      fps={V.fps}
      durationInFrames={fr08Duration('master')}
      calculateMetadata={({ props }) => ({
        durationInFrames: fr08Duration(props.variant) + (props.coverFrames ?? 0),
      })}
    />

    <Still id="FR08Cover" component={FR08Cover} width={V.width} height={V.height} />

    <Composition
      id="FR01Headlines"
      component={FR01Headlines}
      schema={fr01Schema}
      defaultProps={{ variant: 'master' as const, music: DEFAULT_MUSIC }}
      width={V.width}
      height={V.height}
      fps={V.fps}
      durationInFrames={fr01Duration('master')}
      calculateMetadata={({ props }) => ({
        durationInFrames: fr01Duration(props.variant) + (props.coverFrames ?? 0),
      })}
    />

    <Still id="FR01Cover" component={FR01Cover} width={V.width} height={V.height} />

    <Composition
      id="FR07Predictions"
      component={FR07Predictions}
      schema={fr07Schema}
      defaultProps={{ variant: 'master' as const, music: DEFAULT_MUSIC }}
      width={V.width}
      height={V.height}
      fps={V.fps}
      durationInFrames={fr07Duration('master')}
      calculateMetadata={({ props }) => ({
        durationInFrames: fr07Duration(props.variant) + (props.coverFrames ?? 0),
      })}
    />

    <Still id="FR07Cover" component={FR07Cover} width={V.width} height={V.height} />

    <Composition
      id="FR02RankRace"
      component={FR02RankRace}
      schema={fr02Schema}
      defaultProps={{ variant: 'master' as const, music: DEFAULT_MUSIC }}
      width={V.width}
      height={V.height}
      fps={V.fps}
      durationInFrames={fr02Duration('master')}
      calculateMetadata={({ props }) => ({
        durationInFrames: fr02Duration(props.variant) + (props.coverFrames ?? 0),
      })}
    />

    <Still id="FR02Cover" component={FR02Cover} width={V.width} height={V.height} />

    <Composition
      id="FR03MonthlyReset"
      component={FR03MonthlyReset}
      schema={fr03Schema}
      defaultProps={{ variant: 'master' as const, music: DEFAULT_MUSIC }}
      width={V.width}
      height={V.height}
      fps={V.fps}
      durationInFrames={fr03Duration('master')}
      calculateMetadata={({ props }) => ({
        durationInFrames: fr03Duration(props.variant) + (props.coverFrames ?? 0),
      })}
    />

    <Still id="FR03Cover" component={FR03Cover} width={V.width} height={V.height} />

    <Composition
      id="FR10Onboarding"
      component={FR10Onboarding}
      schema={fr10Schema}
      defaultProps={{ variant: 'master' as const, music: DEFAULT_MUSIC }}
      width={V.width}
      height={V.height}
      fps={V.fps}
      durationInFrames={fr10Duration('master')}
      calculateMetadata={({ props }) => ({
        durationInFrames: fr10Duration(props.variant) + (props.coverFrames ?? 0),
      })}
    />

    <Still id="FR10Cover" component={FR10Cover} width={V.width} height={V.height} />

    <Composition
      id="FR09Differentials"
      component={FR09Differentials}
      schema={fr09Schema}
      defaultProps={{ variant: 'master' as const, music: DEFAULT_MUSIC }}
      width={V.width}
      height={V.height}
      fps={V.fps}
      durationInFrames={fr09Duration('master')}
      calculateMetadata={({ props }) => ({
        durationInFrames: fr09Duration(props.variant) + (props.coverFrames ?? 0),
      })}
    />

    <Still id="FR09Cover" component={FR09Cover} width={V.width} height={V.height} />

    <Composition
      id="FR05RivalWatch"
      component={FR05RivalWatch}
      schema={fr05Schema}
      defaultProps={{ variant: 'master' as const, music: DEFAULT_MUSIC }}
      width={V.width}
      height={V.height}
      fps={V.fps}
      durationInFrames={fr05Duration('master')}
      calculateMetadata={({ props }) => ({
        durationInFrames: fr05Duration(props.variant) + (props.coverFrames ?? 0),
      })}
    />

    <Still id="FR05Cover" component={FR05Cover} width={V.width} height={V.height} />

    <Composition
      id="FR06TransferImpact"
      component={FR06TransferImpact}
      schema={fr06Schema}
      defaultProps={{ variant: 'master' as const, music: DEFAULT_MUSIC }}
      width={V.width}
      height={V.height}
      fps={V.fps}
      durationInFrames={fr06Duration('master')}
      calculateMetadata={({ props }) => ({
        durationInFrames: fr06Duration(props.variant) + (props.coverFrames ?? 0),
      })}
    />

    <Still id="FR06Cover" component={FR06Cover} width={V.width} height={V.height} />

    <Composition
      id="FR16TwoTables"
      component={FR16TwoTables}
      schema={fr16Schema}
      defaultProps={{ variant: 'master' as const, music: DEFAULT_MUSIC }}
      width={V.width}
      height={V.height}
      fps={V.fps}
      durationInFrames={fr16Duration('master')}
      calculateMetadata={({ props }) => ({
        durationInFrames: fr16Duration(props.variant) + (props.coverFrames ?? 0),
      })}
    />

    <Still id="FR16Cover" component={FR16Cover} width={V.width} height={V.height} />

    {/* Unlike the other masters, FR-17's leads with cover frames. Beat 1 opens on a
        counter rolling up from zero, so a bare frame 0 posters as
        "0.0 · HIGHEST IN THE GAME" — illegible as a still, and it reads as a wrong
        number. The shorts cut already led with the cover for the same reason. */}
    <Composition
      id="FR17ValueDensity"
      component={FR17ValueDensity}
      schema={fr17Schema}
      defaultProps={{ variant: 'master' as const, music: DEFAULT_MUSIC, coverFrames: 20 }}
      width={V.width}
      height={V.height}
      fps={V.fps}
      durationInFrames={fr17Duration('master')}
      calculateMetadata={({ props }) => ({
        durationInFrames: fr17Duration(props.variant) + (props.coverFrames ?? 0),
      })}
    />

    <Still id="FR17Cover" component={FR17Cover} width={V.width} height={V.height} />
  </>
);

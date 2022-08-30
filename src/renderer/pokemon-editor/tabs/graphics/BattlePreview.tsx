import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import BgImage from '../../../images/battle_bg.png';
import BgImageWithShadow from '../../../images/battle_bg_shadow.png';
import { usePokemonStoreContext } from '../../pokemon.store';

export const BattlePreview = observer(() => {
  const pokemonStore = usePokemonStoreContext();
  const species = pokemonStore.selectedSpecies;
  const battleScreenCanvas = useRef<HTMLCanvasElement>(null);

  if (species) {
    useEffect(() => {
      function getSprite() {
        return `asset://${species!.nameConst.toLowerCase()}/sprites.png`;
      }

      function getCroppedSpriteCanvas(
        xOffset: number,
        callback: (data: HTMLCanvasElement) => void
      ) {
        const spritesheet = new Image();
        spritesheet.src = getSprite();
        spritesheet.addEventListener('load', () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          canvas.width = spritesheet.width;
          canvas.height = spritesheet.height;
          context.drawImage(spritesheet, xOffset, 0, 64, 64, 0, 0, 64, 64);
          const imageData = context.getImageData(0, 0, 64, 64);
          const bgRed = imageData.data[0];
          const bgGreen = imageData.data[1];
          const bgBlue = imageData.data[2];
          const bgAlpha = imageData.data[3];
          for (let i = 0; i < imageData.data.length; i += 4) {
            // is this pixel bg colored
            if (
              imageData.data[i] === bgRed &&
              imageData.data[i + 1] === bgGreen &&
              imageData.data[i + 2] === bgBlue &&
              imageData.data[i + 3] === bgAlpha
            ) {
              // change to transparent
              imageData.data[i] = 0;
              imageData.data[i + 1] = 0;
              imageData.data[i + 2] = 0;
              imageData.data[i + 3] = 0;
            }
          }
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.putImageData(imageData, 0, 0);
          callback(canvas);
        });
      }

      function getFrontSpriteData(callback: (data: HTMLCanvasElement) => void) {
        return getCroppedSpriteCanvas(0, callback);
      }

      function getBackSpriteData(callback: (data: HTMLCanvasElement) => void) {
        return getCroppedSpriteCanvas(192, callback);
      }

      const frontCanvas = battleScreenCanvas.current!;
      const frontContext = frontCanvas.getContext('2d')!;

      const bgImage = new Image();
      bgImage.src = species.enemyElevation > 0 ? BgImageWithShadow : BgImage;
      bgImage.addEventListener('load', () => {
        frontContext.drawImage(bgImage, 0, 0);
        getBackSpriteData((data) => {
          frontContext.drawImage(data, 40, 48 + species.backCoords.y_offset);
        });
        getFrontSpriteData((data) => {
          frontContext.drawImage(
            data,
            144,
            8 + species.frontCoords.y_offset - species.enemyElevation
          );
        });
      });
    }, [
      species,
      species.frontCoords.y_offset,
      species.backCoords.y_offset,
      species.enemyElevation,
    ]);
    return (
      <canvas
        ref={battleScreenCanvas}
        width="240"
        height="160"
        style={{
          imageRendering: 'pixelated',
          height: 320,
        }}
      />
    );
  }
  return null;
});

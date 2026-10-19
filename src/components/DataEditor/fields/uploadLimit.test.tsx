import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ImageField } from './ImageField';
import { ImagesField } from './ImagesField';
import { useS3Upload } from '../hooks/useS3Upload';
import { ATTACHMENT_TOO_LARGE_MESSAGE } from '../../../utils/uploadLimit';

jest.mock('../hooks/useS3Upload');
jest.mock('../../Files', () => ({ PickSource: jest.fn() }));
jest.mock('./AiStatusResultPanel', () => ({ AiStatusResultPanel: () => null }));
jest.mock('./UploadLaterBlock', () => ({ UploadLaterBlock: () => null }));
jest.mock('@ionic/react', () => ({
  IonButton: ({ children }: any) => <button>{children}</button>,
  IonIcon: () => null, IonModal: () => null, IonSpinner: () => null,
}));

for (const multiple of [false, true]) {
  test(`${multiple ? 'multiple' : 'single'} photo displays size error, preserves validation and clears on retry`, () => {
    const hook = useS3Upload as jest.Mock;
    hook.mockReturnValue({ error: new Error(ATTACHMENT_TOO_LARGE_MESSAGE), isUploading: false });
    const field = multiple
      ? <ImagesField label="СНИЛС" value={['https://example.invalid/existing.jpg']} onChange={jest.fn()} error="Ошибка формы" />
      : <ImageField label="СНИЛС" value="https://example.invalid/existing.jpg" onChange={jest.fn()} error="Ошибка формы" />;
    const { rerender } = render(field);
    expect(screen.getByRole('alert')).toHaveTextContent(ATTACHMENT_TOO_LARGE_MESSAGE);
    expect(screen.getByText('Ошибка формы')).toBeInTheDocument();
    hook.mockReturnValue({ error: null, isUploading: true });
    rerender(React.cloneElement(field));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Ошибка формы')).toBeInTheDocument();
    hook.mockReturnValue({ error: new Error('internal provider detail'), isUploading: false });
    rerender(React.cloneElement(field));
    expect(screen.queryByText('internal provider detail')).not.toBeInTheDocument();
  });
}

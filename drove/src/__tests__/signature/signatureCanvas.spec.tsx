import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SignatureCanvas from '@/components/SignatureCanvas';

describe('SignatureCanvas', () => {
  it('draws and clears signature', () => {
    // Mock canvas APIs for jsdom
    const proto = HTMLCanvasElement.prototype as any;
    proto.getContext = vi.fn().mockReturnValue({
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      lineCap: '',
      fillRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
    });
    proto.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,AAA');

    const onChange = vi.fn();
    render(<SignatureCanvas onSignatureChange={onChange} />);

    const canvas = screen.getByTestId('signature-canvas') as HTMLCanvasElement;

    // simulate drawing
    fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(canvas, { clientX: 20, clientY: 20 });
    fireEvent.mouseUp(canvas);

    expect(onChange).toHaveBeenCalled();

    // clear
    const clearBtn = screen.getByRole('button', { name: /borrar firma/i });
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenLastCalledWith('');
  });
});



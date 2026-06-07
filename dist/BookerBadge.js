import { useBooker } from './useBooker';
export function BookerBadge(props) {
    const { text, color, textColor, position, ...rest } = props;
    useBooker({
        ...rest,
        type: 'badge',
        badge: { text, color, textColor, position },
    });
    return null;
}
//# sourceMappingURL=BookerBadge.js.map
import Image from "next/image"

const MemberAvatars = ({ members = [], max = 4 }) => {
    const visible = members.slice(0, max)
    const remaining = members.length - max

    return (
        <div className="flex items-center">
            {/* Stacked avatars */}
            <div className="flex -space-x-3">
                {visible.map((member, idx) => (
                    <div
                        key={member.id}
                        className="w-9 h-9 rounded-full border-2 border-black overflow-hidden bg-neutral-700 flex items-center justify-center shrink-0"
                        style={{ zIndex: visible.length - idx }}
                        title={member?.user?.name}
                    >
                        {member?.user?.imageUrl ? (
                            <Image
                                src={member.user.imageUrl}
                                alt={member.user.name}
                                width={36}
                                height={36}
                                className="object-cover w-full h-full border border-amber-400"
                            />
                        ) : (
                            // Fallback: initials from name
                            <span className="text-xs font-semibold text-white">
                                {member?.user?.name
                                    ?.split(" ")
                                    .map(n => n[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                            </span>
                        )}
                    </div>
                ))}

                {/* +N overflow bubble */}
                {remaining > 0 && (
                    <div
                        className="w-9 h-9 rounded-full border-2 border-black bg-neutral-800 flex items-center justify-center shrink-0"
                        style={{ zIndex: 0 }}
                    >
                        <span className="text-xs font-semibold text-white/70">
                            +{remaining}
                        </span>
                    </div>
                )}
            </div>

            {/* Member count label */}
            <span className="ml-3 text-sm text-white/50">
                {members.length} {members.length === 1 ? "member" : "members"}
            </span>
        </div>
    )
}

export default MemberAvatars
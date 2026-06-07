import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict

class BacklogBox:
    """
    Model representing the discussion thread (BacklogBox) for a unique folder.
    It encapsulates metadata and an embedded array containing chronologically sorted messages.
    """

    def __init__(self,
        folder_id: str,
        agent_id: str,
        company_id: str,  # This will store the company phone number as reference
        backlogbox_id: Optional[str] = None,
        messages: Optional[List[Dict]] = None,
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None
    ):
        self.backlogbox_id = backlogbox_id or str(uuid.uuid4())
        self.folder_id = folder_id
        self.agent_id = agent_id
        self.company_id = company_id.strip()
        
        # Embedded array (Array inside Array architectural design pattern)
        self.messages = messages or []
        
        now = datetime.now(timezone.utc).isoformat()
        self.created_at = created_at or now
        self.updated_at = updated_at or now

    def add_message(self, content: str, sender_id: str, sender_type: str) -> Dict:
        """
        Appends a fully structured message inside the embedded array.
        """
        if not content or not content.strip():
            raise ValueError("Message content cannot be blank.")
            
        if sender_type not in ["admin", "agent", "company", "farmer"]:
            raise ValueError(f"Unauthorized sender role type: {sender_type}")

        new_message = {
            "content": content.strip(),
            "sender_id": sender_id,      # Can be an Agent UUID, Admin UUID or Company Phone Number
            "sender_type": sender_type,  # Used by UI to structure chat alignment bubble shapes
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        self.messages.append(new_message)
        self.updated_at = datetime.now(timezone.utc).isoformat()
        return new_message

    def to_dict(self) -> Dict:
        """Serializes object fields into a JSON compatible python dictionary."""
        return {
            "backlogbox_id": self.backlogbox_id,
            "folder_id": self.folder_id,
            "agent_id": self.agent_id,
            "company_id": self.company_id,
            "messages": self.messages,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

    @classmethod
    def from_dict(cls, data: Dict):
        """Deserializes raw JSON data fields back into an instance of BacklogBox object."""
        return cls(
            backlogbox_id=data.get("backlogbox_id"),
            folder_id=data.get("folder_id"),
            agent_id=data.get("agent_id"),
            company_id=data.get("company_id"),
            messages=data.get("messages", []),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at")
        )
